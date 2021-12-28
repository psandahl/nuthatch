import * as Three from 'three';
import Stats from 'three/examples/jsm/libs/stats.module';

import {
    KeyboardEventTag,
    MouseEventTag,
    WheelEventTag,
    Application,
} from './Application';
import { CameraNavAxesHelper } from '../render/CameraNavAxesHelper';
import { makeGlobe } from '../render/Globe';
import { Size } from '../types/Size';
import { SceneRenderer } from '../render/SceneRenderer';
import { TrackingNavigator } from '../render/TrackingNavigator';
import { SemiMajorAxis } from '../math/Ellipsoid';
import { GeoConvertUtm } from '../math/GeoConvert';
import { ColladaReceiver } from '../types/ColladaReceiver';
import { fetchCollada, modifyTerrainColladaModel } from '../data/ColladaLoad';
import { Collada } from 'three/examples/jsm/loaders/ColladaLoader';
import { fetchJSON } from '../data/JSONLoad';
import { JSONReceiver } from '../types/JSONReceiver';
import { dummyUrlsLvl12 } from '../data/DummyDataUrls';
import * as Track from '../types/TrackingCamera';

export class LabTrackingApplication
    implements Application, ColladaReceiver, JSONReceiver
{
    public constructor(size: Size, renderTarget: HTMLCanvasElement) {
        this.geoConvertUtm = new GeoConvertUtm(10);
        this.scene = new Three.Scene();
        this.renderer = new SceneRenderer(renderTarget);

        const [width, height] = size;
        this.renderer.setSize(width, height);

        this.navigator = new TrackingNavigator(30, 20, 1, SemiMajorAxis, size);

        this.cameraNavAxesHelper = new CameraNavAxesHelper();
        this.scene.add(this.cameraNavAxesHelper.renderable());

        this.stats = Stats();
        document.body.appendChild(this.stats.dom);

        this.scene.add(makeGlobe());

        this.scene.add(new Three.AmbientLight(0x404040, 2.0));

        this.fetchModelDataLvl12();
        this.fetchSequence();
    }

    public render(): void {
        this.renderer.setDrawingArea(this.navigator.getDrawingArea());
        this.cameraNavAxesHelper.updateFromCamera(this.navigator.getCamera());
        this.renderer.render(this.scene, this.navigator.getCamera());

        this.stats.update();
    }

    public resize(size: Size): void {
        this.navigator.setSize(size);
        this.renderer.setDrawingArea(this.navigator.getDrawingArea());
    }

    public tick(elapsed: number): void {
        if (this.sequence.length > 0) {
            this.navigator.setViewFromTrackingCamera(
                this.sequence[this.sequenceIndex]
            );

            if (++this.sequenceIndex === this.sequence.length) {
                this.sequenceIndex = 0;
            }
        }
    }

    public onKey(tag: KeyboardEventTag, event: KeyboardEvent): void {}
    public onWheel(tag: WheelEventTag, event: WheelEvent): void {}
    public onMouse(tag: MouseEventTag, event: MouseEvent): void {}

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
        }
    }

    public receiveColladaFailed(id: number, url: string): void {
        console.warn(`failed to load collada ${url}`);
    }

    public receiveJSONSucceeded(obj: object, id: number, url: string): void {
        this.sequence = obj as Track.Camera[];
    }

    public receiveJSONFailed(id: number, url: string): void {
        console.warn(`failed to load JSON ${url}`);
    }

    private fetchModelDataLvl12(): void {
        const models = dummyUrlsLvl12();
        for (var i = 0; i < models.length; ++i) {
            fetchCollada(i + 1, models[i], this);
        }
    }

    private fetchSequence(): void {
        fetchJSON(1, 'testvideo/sequence.json', this);
    }

    private geoConvertUtm: GeoConvertUtm;
    private scene: Three.Scene;
    private renderer: SceneRenderer;
    private navigator: TrackingNavigator;
    private cameraNavAxesHelper: CameraNavAxesHelper;
    private stats: Stats;
    private sequence: Track.Camera[] = [];
    private sequenceIndex: number = 0;
}
