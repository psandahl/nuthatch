import * as Three from 'three';

import {
    KeyboardEventTag,
    MouseEventTag,
    WheelEventTag,
    Application,
} from './Application';
import { makeGlobe } from '../render/Globe';
import { OrbitingNavigator } from '../render/OrbitingNavigator';
import { SceneRenderer } from '../render/SceneRenderer';
import { SemiMajorAxis } from '../math/Ellipsoid';
import { Size } from '../types/Size';
import { CameraNavAxesHelper } from '../render/CameraNavAxesHelper';

export class LabNavApplication implements Application {
    constructor(size: Size, renderTarget: HTMLCanvasElement) {
        this.scene = new Three.Scene();

        this.renderer = new SceneRenderer(renderTarget);
        const [width, height] = size;
        this.renderer.setSize(width, height);

        this.navigator = new OrbitingNavigator(
            50,
            1.0,
            SemiMajorAxis * 4.0,
            size
        );

        this.cameraNavAxesHelper = new CameraNavAxesHelper();
        this.scene.add(this.cameraNavAxesHelper.renderable());
        this.scene.add(makeGlobe());
    }

    public render(): void {
        this.navigator.updateCamera();
        this.cameraNavAxesHelper.updateFromCamera(this.navigator.getCamera());

        this.renderer.render(this.scene, this.navigator.getCamera());
    }

    public resize(size: Size): void {
        this.navigator.setSize(size);
        this.renderer.setDrawingArea(this.navigator.getDrawingArea());
    }

    public tick(elapsed: number): void {}

    public onKey(tag: KeyboardEventTag, event: KeyboardEvent): void {}

    public onWheel(tag: WheelEventTag, event: WheelEvent): void {
        this.navigator.onWheel(tag, event);
    }

    public onMouse(tag: MouseEventTag, event: MouseEvent): void {
        this.navigator.onMouse(tag, event);
    }

    private scene: Three.Scene;
    private renderer: SceneRenderer;
    private navigator: OrbitingNavigator;
    private cameraNavAxesHelper: CameraNavAxesHelper;
}
