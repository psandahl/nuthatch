import * as Three from 'three';
import Stats from 'three/examples/jsm/libs/stats.module';

import {
    Application,
    KeyboardEventTag,
    MouseEventTag,
    WheelEventTag,
} from './Application';
import { Size } from '../types/Size';
import { Navigator } from '../world/Navigator';
import { OrbitingNavigator } from '../world/OrbitingNavigator';
import { TrackingNavigator } from '../world/TrackingNavigator';
import { IntersectionPoint, Raycaster } from '../world/Raycaster';
import { SemiMajorAxis } from '../math/Ellipsoid';
import { Renderer } from '../render/Renderer';
import { makeGlobe } from '../render/Globe';
import { CameraNavAxesHelper } from '../render/CameraNavAxesHelper';
import { fetchJSON } from '../data/JSONLoad';
import { JSONReceiver } from '../types/JSONReceiver';
import { ColladaReceiver } from '../types/ColladaReceiver';
import { fetchCollada, modifyTerrainColladaModel } from '../data/ColladaLoad';
import { Collada } from 'three/examples/jsm/loaders/ColladaLoader';
import { dummyUrlsLvl12 } from '../data/DummyDataUrls';
import * as Tracking from '../types/TrackingCamera';
import { GeoConvertUtm } from '../math/GeoConvert';
import { TexturedFullscreenQuad } from '../render/TexturedFullsrceenQuad';

/**
 * Internal navigation mode.
 */
enum NavigatorMode {
    Orbiting,
    Tracking,
}

/**
 * Demo application with a few bells and whistles.
 * Keyboard commands:
 * 'o' switch to orbiting navigation from the current pose.
 * 't' switch to tracking navigation from where the track is.
 * 'a' toggle autoplay for tracking navigation.
 * 'v' toggle video overlay for tracking navigation.
 * 'u' toggle undistorsion for video overlay.
 * 'n' next frame for tracking navigation (not autoplay).
 * 'p' previous frame for tracking navigation (not autoplay).
 */
export class DemoApplication
    implements Application, JSONReceiver, ColladaReceiver
{
    /**
     * Construct the demo application.
     * @param size The initial size for the window
     * @param renderTarget The canvas element to render to
     */
    public constructor(size: Size, renderTarget: HTMLCanvasElement) {
        // Note: this one depends on the zone for the dataset.
        this.geoConvertUtm = new GeoConvertUtm(10);

        // Create the scene.
        this.scene = new Three.Scene();

        // Create the renderer.
        this.renderer = new Renderer(renderTarget);
        this.renderer.setSize(size[0], size[1]);

        // Create the runtime stats widget.
        this.stats = Stats();
        document.body.appendChild(this.stats.dom);

        // Create the raycaster for the scene.
        this.rayCaster = new Raycaster(this.scene);

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

        // Create arrow helpers to visualize normals.
        this.surfaceNormal = new Three.ArrowHelper();
        this.surfaceNormal.setLength(50);
        this.surfaceNormal.setColor(0x0000ff);
        this.scene.add(this.surfaceNormal);

        this.vertexNormal = new Three.ArrowHelper();
        this.vertexNormal.setLength(50);
        this.vertexNormal.setColor(0xffff00);
        this.scene.add(this.vertexNormal);

        // To see the textured terrain a light source is needed.
        this.ambientLight = new Three.AmbientLight(0x404040, 2.0);
        this.scene.add(this.ambientLight);

        // Create the image loader used for video images.
        this.imageLoader = new Three.ImageLoader();

        // Create the texture quad used for video overlay.
        this.texturedQuad = new TexturedFullscreenQuad();
        // Note render order.
        this.texturedQuad.mesh().renderOrder = 1;
        this.scene.add(this.texturedQuad.mesh());

        // As the last step in the constructor - load external data.
        this.fetchData();
    }

    /**
     * Render the scene.
     */
    public animationFrame(
        _secondsSinceStart: number,
        _millisSinceLast: number
    ): void {
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
     * Handle the video fps notification.
     */
    public videoFrame(
        _secondsSinceStart: number,
        _millisSinceLast: number
    ): void {
        if (this.trackingValid() && this.autoPlay) {
            this.loadFromTrack();
            this.incTrackIndex();
        }
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
        const intersection = this.rayCaster.intersect(
            this.navigator.getWorldRay(
                new Three.Vector2(event.clientX, event.clientY)
            )
        );
        if (intersection) {
            if (intersection.surfaceNormal) {
                this.surfaceNormal.position.copy(intersection.point);
                this.surfaceNormal.setDirection(intersection.surfaceNormal);
                this.surfaceNormal.visible = true;
            }

            if (intersection.vertexNormal) {
                this.vertexNormal.position.copy(intersection.point);
                this.vertexNormal.setDirection(intersection.vertexNormal);
                this.vertexNormal.visible = true;
            }
        } else {
            this.surfaceNormal.visible = false;
            this.vertexNormal.visible = false;
        }

        if (this.navigatorMode == NavigatorMode.Orbiting) {
            this.orbitingNavigator.onMouse(tag, event);
        }
    }

    /**
     * Notification of a successful JSON fetch.
     * @param obj The JSON object as result from the request
     * @param id Id for the request
     * @param url Url for the request
     */
    public receiveJSONSucceeded(obj: object, _id: number, url: string): void {
        // The tracking data is the only JSON the application is expecting.
        this.track = obj as Tracking.Camera[];
        if (this.track && this.track.length > 0) {
            this.loadFromTrack();
            this.switchToTrackingMode();
        } else {
            const err = `Unexpected error in converting JSON data from '${url}'`;
            console.error(err);
            alert(err);
        }
    }

    /**
     * Notification that a JSON fetch has failed.
     * @param id Id for the request
     * @param url Url for the request
     */
    public receiveJSONFailed(_id: number, url: string): void {
        const err = `Failed to load JSON data from '${url}'`;
        console.error(err);
        alert(err);
    }

    /**
     * Notification of a successful Collada fetch.
     * @param model
     * @param id Id for the request
     * @param url Url for the request
     */
    public receiveColladaSucceeded(
        model: Collada,
        _id: number,
        url: string
    ): void {
        const [result, bbox] = modifyTerrainColladaModel(
            this.geoConvertUtm,
            model
        );
        if (result) {
            this.scene.add(model.scene);
        } else {
            const err = `Unexpected error in converting Collada data from '${url}'`;
            console.error(err);
            alert(err);
        }
    }

    /**
     * Notification that a Collada fetch has failed.
     * @param id Id for the request
     * @param url Url for the request
     */
    public receiveColladaFailed(_id: number, url: string): void {
        const err = `Failed to load Collada data from '${url}'`;
        console.error(err);
        alert(err);
    }

    private onKeyDown(event: KeyboardEvent): void {
        if (event.code == 'KeyO') {
            this.switchToOrbitingMode();
        } else if (event.code == 'KeyT') {
            this.switchToTrackingMode();
        } else if (event.code == 'KeyA' && this.trackingValid()) {
            this.autoPlay = !this.autoPlay;
        } else if (event.code == 'KeyV' && this.trackingValid()) {
            this.texturedQuad.toggleVisibility();
        } else if (event.code == 'KeyU' && this.trackingValid()) {
            this.texturedQuad.toggleUndistort();
        } else if (
            event.code == 'KeyN' &&
            this.trackingValid() &&
            !this.autoPlay
        ) {
            this.incTrackIndex();
            this.loadFromTrack();
        } else if (
            event.code == 'KeyP' &&
            this.trackingValid() &&
            !this.autoPlay
        ) {
            this.decTrackIndex();
            this.loadFromTrack();
        }
    }

    private switchToOrbitingMode(): void {
        if (this.navigatorMode == NavigatorMode.Tracking) {
            // Video overlay shall not be visible in orbiting mode.
            this.texturedQuad.mesh().visible = false;

            // The orbiting navigator shall inherit the pose of
            // the tracking navigator.
            const [position, at, up] = this.trackingNavigator.getLookAt();

            // Then use the data to set the orbiter.
            this.orbitingNavigator.lookAt(position, at, up);

            // Inherit fov and size.
            this.orbitingNavigator.getCamera().fov =
                this.trackingNavigator.getCamera().fov;
            this.orbitingNavigator.setSize(this.navigator.getSize());

            this.navigator = this.orbitingNavigator;
            this.navigatorMode = NavigatorMode.Orbiting;
        }
    }

    private switchToTrackingMode(): void {
        if (this.navigatorMode == NavigatorMode.Orbiting) {
            // Make overlay visible.
            this.texturedQuad.mesh().visible = true;

            // Inherit size, otherwise just continue where tracking navigator are.
            this.trackingNavigator.setSize(this.navigator.getSize());
            this.navigator = this.trackingNavigator;
            this.navigatorMode = NavigatorMode.Tracking;
        }
    }

    private loadFromTrack(): void {
        const cam = this.track[this.trackIndex];
        const url = `testvideo/${cam['frame-id']}.png`;

        this.imageLoader.load(
            url,
            (image) => {
                this.texturedQuad.updataCameraMetadata(
                    this.trackingNavigator.getCamera().projectionMatrix,
                    this.trackingNavigator.getCamera().projectionMatrixInverse,
                    new Three.Vector3(cam.lens.k2, cam.lens.k3, cam.lens.k4)
                );
                this.texturedQuad.updateTexture(image);
                this.trackingNavigator.setViewFromTrackingCamera(cam);
            },
            (_err) => {
                console.error(`Failed to load image '${url}'`);
            }
        );
    }

    private trackingValid(): boolean {
        return (
            this.navigatorMode == NavigatorMode.Tracking &&
            this.track.length > 0
        );
    }

    private incTrackIndex(): void {
        this.trackIndex = (this.trackIndex + 1) % this.track.length;
    }

    private decTrackIndex(): void {
        this.trackIndex = (this.trackIndex - 1) % this.track.length;
        if (this.trackIndex == -1) {
            this.trackIndex = this.track.length - 1;
        }
    }

    private fetchData(): void {
        const models = dummyUrlsLvl12();
        for (var i = 0; i < models.length; ++i) {
            fetchCollada(i + 1, models[i], this);
        }
        fetchJSON(1, 'testvideo/sequence.json', this);
    }

    private geoConvertUtm: GeoConvertUtm;

    private scene: Three.Scene;
    private renderer: Renderer;
    private stats: Stats;

    private navigatorMode = NavigatorMode.Orbiting;
    private orbitingNavigator: OrbitingNavigator;
    private trackingNavigator: TrackingNavigator;
    private navigator: Navigator;

    private rayCaster: Raycaster;

    private globe: Three.Mesh;
    private navAxesHelper: CameraNavAxesHelper;
    private ambientLight: Three.AmbientLight;

    private surfaceNormal: Three.ArrowHelper;
    private vertexNormal: Three.ArrowHelper;

    private imageLoader: Three.ImageLoader;
    private texturedQuad: TexturedFullscreenQuad;

    private track: Tracking.Camera[] = [];
    private trackIndex = 0;

    private autoPlay = false;
}
