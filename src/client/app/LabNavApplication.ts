import * as Three from 'three';

import { Application } from './Application';
import { makeGlobe } from '../render/Globe';
import { OrbitingWorldNavigator } from '../render/OrbitingWorldNavigator';
import { SceneRenderer } from '../render/SceneRenderer';
import { SemiMajorAxis } from '../math/Ellipsoid';
import { Size } from '../types/Size';
import { CameraAxesHelper } from '../render/CameraAxesHelper';

export class LabNavApplication implements Application {
    constructor(size: Size, renderTarget: HTMLCanvasElement) {
        this.scene = new Three.Scene();

        this.renderer = new SceneRenderer(renderTarget);
        const [width, height] = size;
        this.renderer.setSize(width, height);

        this.navigator = new OrbitingWorldNavigator(
            50,
            1.0,
            SemiMajorAxis * 4.0,
            this.renderer.domElement
        );

        this.cameraAxesHelper = new CameraAxesHelper();
        this.scene.add(this.cameraAxesHelper.renderable());
        this.scene.add(makeGlobe());
    }

    public render(): void {
        this.navigator.updateCamera();
        this.cameraAxesHelper.updateFromCamera(this.navigator.getCamera());

        this.renderer.render(this.scene, this.navigator.getCamera());
    }

    public resize(size: Size): void {
        this.navigator.setSize(size);
        this.renderer.setDrawingArea(this.navigator.getDrawingArea());
    }

    public tick(elapsed: number): void {}

    private scene: Three.Scene;
    private renderer: SceneRenderer;
    private navigator: OrbitingWorldNavigator;
    private cameraAxesHelper: CameraAxesHelper;
}
