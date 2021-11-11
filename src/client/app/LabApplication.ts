import * as Three from 'three';
import Stats from 'three/examples/jsm/libs/stats.module';

import { IApplication } from './IApplication';
import { CameraMode, SceneCamera } from '../render/SceneCamera';
import { SceneRenderer } from '../render/SceneRenderer';
import { calculateDrawingArea, fullDrawingArea } from '../render/DrawingArea';
import { TexturedFullscreenQuad } from '../render/TexturedFullsrceenQuad';

export class LabApplication implements IApplication {
    public constructor(width: number, height: number) {
        this.width = width;
        this.height = height;

        this.scene = new Three.Scene();

        this.sceneCamera = new SceneCamera();
        this.sceneCamera.resize(width, height);
        this.sceneCamera.setFov(1.0, 0.7);
        this.sceneCamera.position.z = 5;

        this.sceneRenderer = new SceneRenderer();

        this.stats = Stats();
        document.body.appendChild(this.stats.dom);

        const geo = new Three.BoxGeometry(1.0, 1.0, 1.0);
        const mat = new Three.MeshBasicMaterial({ color: 0xffff00 });
        const box = new Three.Mesh(geo, mat);
        this.scene.add(box);

        const texturedQuad = new TexturedFullscreenQuad();
        texturedQuad.updataCameraMetadata(
            this.sceneCamera.projectionMatrix,
            this.sceneCamera.projectionMatrixInverse,
            new Three.Vector3(1.5, 0.0, 0.0)
        );
        this.scene.add(texturedQuad.mesh());

        window.onkeydown = (event: KeyboardEvent) => {
            if (event.code == 'KeyC') {
                this.sceneCamera.setMode(CameraMode.CanvasAdapting);
                this.resize(this.width, this.height);
            } else if (event.code == 'KeyF') {
                this.sceneCamera.setMode(CameraMode.CameraAdapting);
                this.resize(this.width, this.height);
            }
        };
    }

    public render(): void {
        this.sceneRenderer.render(this.scene, this.sceneCamera);
        this.stats.update();
    }

    public resize(width: number, height: number): void {
        this.width = width;
        this.height = height;

        this.sceneCamera.resize(width, height);
        const drawingArea =
            this.sceneCamera.getMode() == CameraMode.CanvasAdapting
                ? fullDrawingArea(width, height)
                : calculateDrawingArea(
                      width,
                      height,
                      this.sceneCamera.getAspectRatio()
                  );
        this.sceneRenderer.setDrawingArea(drawingArea);
    }

    private width: number;
    private height: number;
    private scene: Three.Scene;
    private sceneCamera: SceneCamera;
    private sceneRenderer: SceneRenderer;
    private stats: Stats;
}
