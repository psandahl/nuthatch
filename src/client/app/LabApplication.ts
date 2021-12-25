import * as Three from 'three';
import Stats from 'three/examples/jsm/libs/stats.module';

import {
    KeyboardEventTag,
    MouseEventTag,
    WheelEventTag,
    Application,
} from './Application';
import { calculateDrawingArea, fullDrawingArea } from '../types/DrawingArea';
import { CameraMode, SceneCamera } from '../render/SceneCamera';
import { fetchImage } from '../data/ImageLoad';
import { ImageReceiver } from '../types/ImageReceiver';
import { SceneRenderer } from '../render/SceneRenderer';
import { Size } from '../types/Size';
import { TexturedFullscreenQuad } from '../render/TexturedFullsrceenQuad';

export class LabApplication implements Application, ImageReceiver {
    public constructor(size: Size, renderTarget: HTMLCanvasElement) {
        this.size = size;

        this.scene = new Three.Scene();

        this.sceneCamera = new SceneCamera();
        const [width, height] = size; // tmp
        this.sceneCamera.resize(width, height);
        this.sceneCamera.setFov(1.0, 0.7);
        this.sceneCamera.position.z = 5;

        this.sceneRenderer = new SceneRenderer(renderTarget);

        this.stats = Stats();
        document.body.appendChild(this.stats.dom);

        const geo = new Three.BoxGeometry(1.0, 1.0, 1.0);
        const mat = new Three.MeshBasicMaterial({ color: 0xffff00 });
        const box = new Three.Mesh(geo, mat);
        this.scene.add(box);

        this.texturedQuad = new TexturedFullscreenQuad();
        this.texturedQuad.updataCameraMetadata(
            this.sceneCamera.projectionMatrix,
            this.sceneCamera.projectionMatrixInverse,
            new Three.Vector3(0.0, 0.0, 0.0)
        );
        this.scene.add(this.texturedQuad.mesh());

        window.onkeydown = (event: KeyboardEvent) => {
            if (event.code == 'KeyC') {
                this.sceneCamera.setMode(CameraMode.CanvasAdapting);
                this.resize(this.size);
            } else if (event.code == 'KeyF') {
                this.sceneCamera.setMode(CameraMode.CameraAdapting);
                this.resize(this.size);
            }
        };

        fetchImage(1, 'images/city.jpg', this);
    }

    public render(): void {
        this.sceneRenderer.render(this.scene, this.sceneCamera);
        this.stats.update();
    }

    public resize(size: Size): void {
        const [width, height] = size;

        this.sceneCamera.resize(width, height);
        const drawingArea =
            this.sceneCamera.getMode() == CameraMode.CanvasAdapting
                ? fullDrawingArea(size)
                : calculateDrawingArea(size, this.sceneCamera.getAspectRatio());
        this.sceneRenderer.setDrawingArea(drawingArea);
    }

    public tick(elapsed: number): void {}

    public onKey(tag: KeyboardEventTag, event: KeyboardEvent): void {}
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

    private size: Size;
    private scene: Three.Scene;
    private sceneCamera: SceneCamera;
    private sceneRenderer: SceneRenderer;
    private texturedQuad: TexturedFullscreenQuad;
    private stats: Stats;
}
