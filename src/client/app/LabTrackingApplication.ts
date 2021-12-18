import * as Three from 'three';

import { Application } from './Application';
import { CameraAxesHelper } from '../render/CameraAxesHelper';
import { makeGlobe } from '../render/Globe';
import { Size } from '../types/Size';
import { SceneRenderer } from '../render/SceneRenderer';
import { TrackingWorldNavigator } from '../render/TrackingWorldNavigator';
import { SemiMajorAxis } from '../math/Ellipsoid';

export class LabTrackingApplication implements Application {
    public constructor(size: Size) {
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
        this.scene.add(makeGlobe());
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

    private scene: Three.Scene;
    private renderer: SceneRenderer;
    private navigator: TrackingWorldNavigator;
    private cameraAxesHelper: CameraAxesHelper;
}
