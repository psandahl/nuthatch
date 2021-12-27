import * as Three from 'three';
import Stats from 'three/examples/jsm/libs/stats.module';

import {
    Application,
    KeyboardEventTag,
    MouseEventTag,
    WheelEventTag,
} from './Application';
import { Size } from '../types/Size';
import { Navigator } from '../render/Navigator';
import { OrbitingNavigator } from '../render/OrbitingNavigator';
import { TrackingNavigator } from '../render/TrackingNavigator';
import { SemiMajorAxis } from '../math/Ellipsoid';
import { SceneRenderer } from '../render/SceneRenderer';
import { makeGlobe } from '../render/Globe';
import { CameraNavAxesHelper } from '../render/CameraNavAxesHelper';
import { extractBasis, matrixNedToGl4 } from '../math/Matrix';

/**
 * Internal navigation mode.
 */
enum NavigatorMode {
    Orbiting,
    Tracking,
}

/**
 * Demo application with a few bells and whistles.
 */
export class DemoApplication implements Application {
    /**
     * Construct the demo application.
     * @param size The initial size for the window
     * @param renderTarget The canvas element to render to
     */
    public constructor(size: Size, renderTarget: HTMLCanvasElement) {
        // Create the scene.
        this.scene = new Three.Scene();

        // Create the renderer.
        this.renderer = new SceneRenderer(renderTarget);
        this.renderer.setSize(size[0], size[1]);

        // Create the runtime stats widget.
        this.stats = Stats();
        document.body.appendChild(this.stats.dom);

        // Create an orbiting navigator with reasonable settings.
        this.orbitingNavigator = new OrbitingNavigator(
            50.0,
            1.0,
            SemiMajorAxis * 4.0,
            size
        );

        // Create a tracking navigator with reasonable settings.
        this.trackingNavigator = new TrackingNavigator(
            30,
            20,
            1,
            SemiMajorAxis,
            size
        );

        // Set the current navigator - start with the orbiting navigator.
        // When tracking data is loaded the mode will be switched.
        this.navigator = this.orbitingNavigator;

        // Create a textured globe to use as fallback terrain texture.
        this.globe = makeGlobe();
        this.scene.add(this.globe);

        // Create camera navigation axes helper.
        this.navAxesHelper = new CameraNavAxesHelper();
        this.scene.add(this.navAxesHelper.renderable());
    }

    /**
     * Render the scene.
     */
    public render(): void {
        // Let the navigator update its camera.
        this.navigator.updateCamera();

        // Update the axes helper from the navigator's camera.
        this.navAxesHelper.updateFromCamera(this.navigator.getCamera());

        // Set the drawing area for the renderer and render the scene.
        this.renderer.setDrawingArea(this.navigator.getDrawingArea());
        this.renderer.render(this.scene, this.navigator.getCamera());

        // Update the runtime stats after the rendering.
        this.stats.update();
    }

    /**
     * Resize the application.
     * @param size The new size
     */
    public resize(size: Size): void {
        // Set new size for the navigator.
        this.navigator.setSize(size);

        // Update the renderer with the navigator's new drawing area.
        this.renderer.setDrawingArea(this.navigator.getDrawingArea());
    }

    /**
     * Handle the video fps notification.
     * @param elapsed The number of milliseconds since latest tick
     */
    public tick(elapsed: number): void {}

    /**
     * Handle keyboard events.
     * @param tag The tag for the event
     * @param event The event
     */
    public onKey(tag: KeyboardEventTag, event: KeyboardEvent): void {
        if (tag == KeyboardEventTag.Down) {
            this.onKeyDown(event);
        }
    }

    /**
     * Handle wheel events.
     * @param tag The tag for the event
     * @param event The event
     */
    public onWheel(tag: WheelEventTag, event: WheelEvent): void {
        if (this.navigatorMode == NavigatorMode.Orbiting) {
            this.orbitingNavigator.onWheel(tag, event);
        }
    }

    /**
     * Handle mouse events.
     * @param tag The tag for the event
     * @param event The event
     */
    public onMouse(tag: MouseEventTag, event: MouseEvent): void {
        if (this.navigatorMode == NavigatorMode.Orbiting) {
            this.orbitingNavigator.onMouse(tag, event);
        }
    }

    private onKeyDown(event: KeyboardEvent): void {
        if (event.code == 'KeyO') {
            this.switchToOrbitingMode();
        } else if (event.code == 'KeyT') {
            this.switchToTrackingMode();
        }
    }

    private switchToOrbitingMode(): void {
        if (this.navigatorMode == NavigatorMode.Tracking) {
            // The orbiting navigator shall inherit the pose of
            // the tracking navigator.

            // Get a NED matrix from the tracking camera and extract its
            // basis vectors.
            const gl4ToNed = matrixNedToGl4().transpose();
            const [front, _right, down] = extractBasis(
                gl4ToNed.premultiply(
                    this.trackingNavigator.getCamera().matrixWorld
                )
            );

            // Then use the data to set the orbiter.
            this.orbitingNavigator.lookAt(
                this.trackingNavigator.getCamera().position.clone(),
                this.trackingNavigator
                    .getCamera()
                    .position.clone()
                    .addScaledVector(front, 1.0),
                down.negate()
            );

            this.navigator = this.orbitingNavigator;
            this.navigatorMode = NavigatorMode.Orbiting;
        }
    }

    private switchToTrackingMode(): void {
        if (this.navigatorMode == NavigatorMode.Orbiting) {
            this.navigator = this.trackingNavigator;
            this.navigatorMode = NavigatorMode.Tracking;
        }
    }

    private scene: Three.Scene;
    private renderer: SceneRenderer;
    private stats: Stats;

    private navigatorMode = NavigatorMode.Orbiting;
    private orbitingNavigator: OrbitingNavigator;
    private trackingNavigator: TrackingNavigator;
    private navigator: Navigator;

    private globe: Three.Mesh;
    private navAxesHelper: CameraNavAxesHelper;
}
