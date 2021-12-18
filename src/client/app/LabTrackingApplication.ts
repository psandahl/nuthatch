import * as Three from 'three';

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

export class LabTrackingApplication implements Application, ColladaReceiver {
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

        /*
        pos x> 45.5056
        pos y> -122.675
        pos z> 2006.28
        platform yaw> 0
        platform pitch> 0
        platform roll> 0
        sensor yaw> 4.9761
        sensor pitch> -55.3083
        sensor roll> -11.6802
        horizontal fov> 41.0183
        vertical fov> 23.7648

        x: 45.5071
        y: -122.67
        z: 2004.15

        yaw: -11.1586
        pitch: -56.5292
        roll: -11.1679

        hfov: 6.81619
        vfov: 3.8372

        */
        this.navigator.setView(
            new Three.Vector3(45.5056, -122.675, 2006.28),
            //new Three.Vector3(45.5071, -122.67, 2004.15),
            new Three.Vector3(0, 0, 0),
            new Three.Vector3(4.9761, -55.3083, -11.6802),
            //new Three.Vector3(-11.1586, -56.5292, -11.1679),
            41.0183,
            23.7648
            //6.81619,
            //3.8372
        );
        this.renderer.setDrawingArea(this.navigator.getDrawingArea());

        this.cameraAxesHelper = new CameraAxesHelper();
        this.scene.add(this.cameraAxesHelper.renderable());

        this.scene.add(makeGlobe());

        this.scene.add(new Three.AmbientLight(0x404040, 2.0));
        this.fetchModelData();
    }

    public render(): void {
        this.cameraAxesHelper.updateFromCamera(this.navigator.getCamera());
        this.renderer.render(this.scene, this.navigator.getCamera());
    }

    public resize(size: Size): void {
        this.navigator.setSize(size);
        this.renderer.setDrawingArea(this.navigator.getDrawingArea());
    }

    public tick(elapsed: number): void {}

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
            console.log('add model');
            this.scene.add(model.scene);
        }
    }

    public receiveColladaFailed(id: number, url: string): void {
        console.warn(`failed to load collada ${url}`);
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

    private geoConvertUtm: GeoConvertUtm;
    private scene: Three.Scene;
    private renderer: SceneRenderer;
    private navigator: TrackingWorldNavigator;
    private cameraAxesHelper: CameraAxesHelper;
}
