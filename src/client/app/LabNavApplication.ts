import * as Three from 'three';

import {
    KeyboardEventTag,
    MouseEventTag,
    WheelEventTag,
    Application,
} from './Application';
import { makeGlobe } from '../render/Globe';
import { OrbitingNavigator } from '../world/OrbitingNavigator';
import { Renderer } from '../render/Renderer';
import { SemiMajorAxis } from '../math/Ellipsoid';
import { Size } from '../types/Size';
import { CameraNavAxesHelper } from '../render/CameraNavAxesHelper';

export class LabNavApplication implements Application {
    constructor(size: Size, renderTarget: HTMLCanvasElement) {
        this.scene = new Three.Scene();

        this.renderer = new Renderer(renderTarget);
        const [width, height] = size;
        this.renderer.setSize(width, height);

        this.navigator = new OrbitingNavigator(50, size);

        this.cameraNavAxesHelper = new CameraNavAxesHelper();
        this.scene.add(this.cameraNavAxesHelper.renderable());
        this.scene.add(makeGlobe());
    }

    public animationFrame(
        _secondsSinceStart: number,
        _millisSinceLast: number
    ): void {
        this.navigator.updateCamera();
        this.cameraNavAxesHelper.updateFromCamera(this.navigator.getCamera());

        this.renderer.render(this.scene, this.navigator.getCamera());
    }

    public videoFrame(
        _secondsSinceStart: number,
        _millisSinceLast: number
    ): void {}

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

    private scene: Three.Scene;
    private renderer: Renderer;
    private navigator: OrbitingNavigator;
    private cameraNavAxesHelper: CameraNavAxesHelper;
}
