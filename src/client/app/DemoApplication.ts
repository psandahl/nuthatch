import * as Three from 'three';

import {
    Application,
    KeyboardEventTag,
    MouseEventTag,
    WheelEventTag,
} from './Application';
import { Size } from '../types/Size';
import { OrbitingWorldNavigator } from '../render/OrbitingWorldNavigator';
import { TrackingWorldNavigator } from '../render/TrackingWorldNavigator';
import { SemiMajorAxis } from '../math/Ellipsoid';
import { SceneRenderer } from '../render/SceneRenderer';
import { makeGlobe } from '../render/Globe';
import { CameraNavAxesHelper } from '../render/CameraNavAxesHelper';
import { WorldNavigator } from '../render/WorldNavigator';

enum NavigatorMode {
    Orbiting,
    Tracking,
}

export class DemoApplication implements Application {
    public constructor(size: Size, renderTarget: HTMLCanvasElement) {
        // Create the scene.
        this.scene = new Three.Scene();

        // Create the renderer.
        this.renderer = new SceneRenderer(renderTarget);
        this.renderer.setSize(size[0], size[1]);

        // Create an orbiting navigator with reasonable settings.
        this.orbitingNavigator = new OrbitingWorldNavigator(
            50.0,
            1.0,
            SemiMajorAxis * 4.0,
            size
        );

        // Set the current navigator.
        this.navigator = this.orbitingNavigator;

        // Create a textured globe to use as fallback terrain texture.
        this.globe = makeGlobe();
        this.scene.add(this.globe);

        // Create camera navigation axes helper.
        this.navAxesHelper = new CameraNavAxesHelper();
        this.scene.add(this.navAxesHelper.renderable());
    }

    public render(): void {
        this.navigator.updateCamera();

        this.navAxesHelper.updateFromCamera(this.navigator.getCamera());

        this.renderer.setDrawingArea(this.navigator.getDrawingArea());
        this.renderer.render(this.scene, this.navigator.getCamera());
    }

    public resize(size: Size): void {
        this.navigator.setSize(size);
        this.renderer.setDrawingArea(this.navigator.getDrawingArea());
    }

    public tick(elapsed: number): void {}

    public onKey(tag: KeyboardEventTag, event: KeyboardEvent): void {
        if (tag == KeyboardEventTag.Down) {
            this.onKeyDown(event);
        }
    }

    public onWheel(tag: WheelEventTag, event: WheelEvent): void {
        this.orbitingNavigator.onWheel(tag, event);
    }

    public onMouse(tag: MouseEventTag, event: MouseEvent): void {
        this.orbitingNavigator.onMouse(tag, event);
    }

    private onKeyDown(event: KeyboardEvent): void {
        if (event.code == 'KeyO') {
            this.switchToOrbitingMode();
        } else if (event.code == 'KeyT') {
            this.switchToTrackingMode();
        }
    }

    private switchToOrbitingMode(): void {
        console.log('to orbiting');
    }

    private switchToTrackingMode(): void {
        console.log('to tracking');
    }

    private scene: Three.Scene;
    private renderer: SceneRenderer;

    private navigatorMode = NavigatorMode.Orbiting;
    private orbitingNavigator: OrbitingWorldNavigator;
    //private trackingNavigator: TrackingWorldNavigator;
    private navigator: WorldNavigator;

    private globe: Three.Mesh;
    private navAxesHelper: CameraNavAxesHelper;
}
