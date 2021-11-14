import * as Three from 'three';

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

import { Application } from './Application';
import { fullDrawingArea } from '../render/DrawingArea';
import { SceneCamera } from '../render/SceneCamera';
import { SceneRenderer } from '../render/SceneRenderer';

export class Lab3DTilesApplication implements Application {
    public constructor(width: number, height: number) {
        this.width = width;
        this.height = height;

        this.scene = new Three.Scene();
        this.renderer = new SceneRenderer();
        this.camera = new SceneCamera();
        this.camera.resize(width, height);
        this.camera.position.z = 5;

        const geo = new Three.BoxGeometry(1, 1, 1);
        const mat = new Three.MeshBasicMaterial({
            color: 0xffff00,
            wireframe: true,
        });
        const mesh = new Three.Mesh(geo, mat);
        mesh.position.set(1, 2, 1);
        this.scene.add(mesh);

        console.log(mesh.getWorldPosition(new Three.Vector3()));

        this.navigator = new OrbitControls(
            this.camera,
            this.renderer.domElement
        );
    }

    public render(): void {
        this.navigator.update();
        this.camera.updateMatrixWorld();
        this.renderer.render(this.scene, this.camera);
    }

    public resize(width: number, height: number): void {
        this.width = width;
        this.height = height;
        this.camera.resize(width, height);
        this.renderer.setDrawingArea(fullDrawingArea(width, height));
    }

    private width: number;
    private height: number;
    private scene: Three.Scene;
    private renderer: SceneRenderer;
    private camera: SceneCamera;
    private navigator: OrbitControls;
}
