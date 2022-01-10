import * as Three from 'three';
import Stats from 'three/examples/jsm/libs/stats.module';

import {
    KeyboardEventTag,
    MouseEventTag,
    WheelEventTag,
    Application,
} from './Application';
import { Collada } from 'three/examples/jsm/loaders/ColladaLoader';
import { fetchCollada, modifyTerrainColladaModel } from '../data/ColladaLoad';
import { GeoConvertUtm } from '../math/GeoConvert';
import { ColladaReceiver } from '../types/ColladaReceiver';
import { Size } from '../types/Size';
import { Renderer } from '../render/Renderer';
import { OrbitingNavigator } from '../world/OrbitingNavigator';
import { makeGlobe } from '../render/Globe';
import { CameraNavAxesHelper } from '../render/CameraNavAxesHelper';
import { dummyUrlsLvl12 } from '../data/DummyDataUrls';

export class LabColladaApplication implements Application, ColladaReceiver {
    public constructor(size: Size, renderTarget: HTMLCanvasElement) {
        this.geoConvertUtm = new GeoConvertUtm(10);
        this.scene = new Three.Scene();

        this.renderer = new Renderer(renderTarget);
        const [width, height] = size;
        this.renderer.setSize(width, height);

        this.navigator = new OrbitingNavigator(50, size);

        this.cameraNavAxesHelper = new CameraNavAxesHelper();

        this.stats = Stats();
        document.body.appendChild(this.stats.dom);

        this.scene.add(this.cameraNavAxesHelper.renderable());
        this.scene.add(makeGlobe());

        this.bbox = new Three.Box3();
        this.fetchModelData();
    }

    public animationFrame(
        _secondsSinceStart: number,
        _deltaMillis: number
    ): void {
        this.navigator.updateCamera();
        this.cameraNavAxesHelper.updateFromCamera(this.navigator.getCamera());
        this.renderer.render(this.scene, this.navigator.getCamera());

        this.stats.update();
    }

    public videoFrame(_secondsSinceStart: number, _deltaMillis: number): void {}

    public resize(size: Size): void {
        this.navigator.setSize(size);
        this.renderer.setDrawingArea(this.navigator.getDrawingArea());
    }

    public onKey(tag: KeyboardEventTag, event: KeyboardEvent): void {}

    public onWheel(tag: WheelEventTag, event: WheelEvent): void {
        this.navigator.onWheel(tag, event);
    }

    public onMouse(tag: MouseEventTag, event: MouseEvent): void {
        this.navigator.onMouse(tag, event);
    }

    public receiveColladaSucceeded(
        model: Collada,
        _id: number,
        _url: string
    ): void {
        const [result, bbox] = modifyTerrainColladaModel(
            this.geoConvertUtm,
            model,
            true
        );
        if (result) {
            this.scene.add(model.scene);

            this.bbox.union(bbox);
            const center = this.bbox.getCenter(new Three.Vector3());

            const normal = center.clone().normalize();
            const camPos = center.clone().addScaledVector(normal, 3000.0);

            this.navigator.tiltedAt(camPos);
        }
    }

    public receiveColladaFailed(id: number, url: string): void {
        console.warn(`failed to load collada ${url}`);
    }

    private fetchModelData(): void {
        const models = dummyUrlsLvl12();
        for (var i = 0; i < models.length; ++i) {
            fetchCollada(i + 1, models[i], this);
        }
    }

    private geoConvertUtm: GeoConvertUtm;
    private scene: Three.Scene;
    private renderer: Renderer;
    private navigator: OrbitingNavigator;
    private cameraNavAxesHelper: CameraNavAxesHelper;
    private stats: Stats;
    private bbox: Three.Box3;
}
