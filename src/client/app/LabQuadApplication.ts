import * as Three from 'three';

import {
    KeyboardEventTag,
    MouseEventTag,
    WheelEventTag,
    Application,
} from './Application';
import { calculateDrawingArea } from '../types/DrawingArea';
import { fetchImage } from '../data/ImageLoad';
import { ImageReceiver } from '../types/ImageReceiver';
import { Renderer } from '../render/Renderer';
import { Size } from '../types/Size';
import { TexturedFullscreenQuad } from '../render/TexturedFullsrceenQuad';

export class LabQuadApplication implements Application, ImageReceiver {
    public constructor(size: Size, renderTarget: HTMLCanvasElement) {
        this.scene = new Three.Scene();
        this.camera = new Three.PerspectiveCamera(
            50,
            1280.0 / 720.0,
            1.0,
            100.0
        );
        this.camera.position.z = 5;

        this.sceneRenderer = new Renderer(renderTarget);
        this.sceneRenderer.setDrawingArea(
            calculateDrawingArea(size, this.camera.aspect)
        );

        this.texturedQuad = new TexturedFullscreenQuad();
        this.texturedQuad.updataCameraMetadata(
            this.camera.projectionMatrix,
            this.camera.projectionMatrixInverse,
            new Three.Vector3(-8.76201, 327.685961, 0.0)
        );
        this.texturedQuad.toggleUndistort();
        this.scene.add(this.texturedQuad.mesh());

        fetchImage(1, 'images/city.jpg', this);
    }

    public animationFrame(
        _secondsSinceStart: number,
        _millisSinceLast: number
    ): void {
        this.sceneRenderer.render(this.scene, this.camera);
    }

    public videoFrame(
        _secondsSinceStart: number,
        _millisSinceLast: number
    ): void {}

    public resize(size: Size): void {
        this.sceneRenderer.setDrawingArea(
            calculateDrawingArea(size, this.camera.aspect)
        );
    }

    public onKey(tag: KeyboardEventTag, event: KeyboardEvent): void {
        if (tag == KeyboardEventTag.Down && event.code == 'KeyU') {
            this.texturedQuad.toggleUndistort();
        }
    }
    public onWheel(tag: WheelEventTag, event: WheelEvent): void {}
    public onMouse(tag: MouseEventTag, event: MouseEvent): void {}

    public receiveImageSucceeded(
        image: HTMLImageElement,
        id: number,
        url: string
    ): void {
        this.texturedQuad.updateTexture(image);
    }

    public receiveImageFailed(id: number, url: string): void {
        console.warn(
            `Failed to fetch image from url ${url} with request id ${id}`
        );
    }

    private scene: Three.Scene;
    private camera: Three.PerspectiveCamera;
    private sceneRenderer: Renderer;
    private texturedQuad: TexturedFullscreenQuad;
}
