import * as Three from 'three';
import Stats from 'three/examples/jsm/libs/stats.module';

import { Application } from './Application';
import { CameraAxesHelper } from '../render/CameraAxesHelper';
import { makeGlobe } from '../render/Globe';
import { Size } from '../types/Size';
import { SceneRenderer } from '../render/SceneRenderer';
import { TrackingWorldNavigator } from '../render/TrackingWorldNavigator';
import { SemiMajorAxis } from '../math/Ellipsoid';
import { GeoConvertUtm } from '../math/GeoConvert';
import { ColladaReceiver } from '../types/ColladaReceiver';
import { fetchCollada, modifyTerrainColladaModel } from '../data/ColladaLoad';
import { Collada } from 'three/examples/jsm/loaders/ColladaLoader';
import { fetchJSON } from '../data/JSONLoad';
import { JSONReceiver } from '../types/JSONReceiver';
import * as UAV from '../types/UAVCamera';

export class LabTrackingApplication
    implements Application, ColladaReceiver, JSONReceiver
{
    public constructor(size: Size) {
        this.geoConvertUtm = new GeoConvertUtm(10);
        this.scene = new Three.Scene();
        this.renderer = new SceneRenderer();

        const [width, height] = size;
        this.renderer.setSize(width, height);

        document.body.appendChild(this.renderer.domElement);

        this.navigator = new TrackingWorldNavigator(
            size,
            30,
            20,
            1,
            SemiMajorAxis
        );

        this.cameraAxesHelper = new CameraAxesHelper();
        this.scene.add(this.cameraAxesHelper.renderable());

        this.stats = Stats();
        document.body.appendChild(this.stats.dom);

        this.scene.add(makeGlobe());

        this.scene.add(new Three.AmbientLight(0x404040, 2.0));

        this.fetchModelData();
        this.fetchSequence();
    }

    public render(): void {
        this.renderer.setDrawingArea(this.navigator.getDrawingArea());
        this.cameraAxesHelper.updateFromCamera(this.navigator.getCamera());
        this.renderer.render(this.scene, this.navigator.getCamera());

        this.stats.update();
    }

    public resize(size: Size): void {
        this.navigator.setSize(size);
        this.renderer.setDrawingArea(this.navigator.getDrawingArea());
    }

    public tick(elapsed: number): void {
        if (
            this.sequenceLoaded &&
            this.modelLoaded &&
            this.sequence.length > 0
        ) {
            const obj = this.sequence[this.sequenceIndex];

            this.navigator.setView(
                new Three.Vector3(
                    obj.position.x,
                    obj.position.y,
                    obj.position.z
                ),
                new Three.Vector3(
                    obj.platform.yaw,
                    obj.platform.pitch,
                    obj.platform.roll
                ),
                new Three.Vector3(
                    obj.lever.yaw,
                    obj.lever.pitch,
                    obj.lever.roll
                ),
                obj.fov.hfov,
                obj.fov.vfov
            );

            if (++this.sequenceIndex === this.sequence.length) {
                this.sequenceIndex = 0;
            }
        }
    }

    public receiveColladaSucceeded(
        model: Collada,
        id: number,
        url: string
    ): void {
        const [result, bbox] = modifyTerrainColladaModel(
            this.geoConvertUtm,
            model
        );
        if (result) {
            this.scene.add(model.scene);
            if (++this.numLoadedModels == 9) {
                this.modelLoaded = true;
            }
        }
    }

    public receiveColladaFailed(id: number, url: string): void {
        console.warn(`failed to load collada ${url}`);
    }

    public receiveJSONSucceeded(obj: object, id: number, url: string): void {
        this.sequence = obj as UAV.UAVCamera[];
        this.sequenceLoaded = true;
    }

    public receiveJSONFailed(id: number, url: string): void {
        console.warn(`failed to load JSON ${url}`);
    }

    private fetchModelData(): void {
        fetchCollada(1, 'collada/10/523/10_523_593/10_523_593.dae', this);
        fetchCollada(2, 'collada/10/523/10_523_594/10_523_594.dae', this);
        fetchCollada(3, 'collada/10/523/10_523_595/10_523_595.dae', this);

        fetchCollada(4, 'collada/10/524/10_524_593/10_524_593.dae', this);
        fetchCollada(5, 'collada/10/524/10_524_594/10_524_594.dae', this);
        fetchCollada(6, 'collada/10/524/10_524_595/10_524_595.dae', this);

        fetchCollada(7, 'collada/10/525/10_525_593/10_525_593.dae', this);
        fetchCollada(8, 'collada/10/525/10_525_594/10_525_594.dae', this);
        fetchCollada(9, 'collada/10/525/10_525_595/10_525_595.dae', this);
    }

    private fetchSequence(): void {
        fetchJSON(1, 'sequences/sequence.json', this);
    }

    private geoConvertUtm: GeoConvertUtm;
    private scene: Three.Scene;
    private renderer: SceneRenderer;
    private navigator: TrackingWorldNavigator;
    private cameraAxesHelper: CameraAxesHelper;
    private stats: Stats;
    private sequence: UAV.UAVCamera[] = [];
    private numLoadedModels: number = 0;
    private modelLoaded: boolean = false;
    private sequenceLoaded: boolean = false;
    private sequenceIndex: number = 0;
}
