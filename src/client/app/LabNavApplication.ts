import * as Three from 'three';

import * as Mat from '../math/Matrix';

import { Application } from './Application';

export class LabNavApplication implements Application {
    constructor(width: number, height: number) {
        this.scene = new Three.Scene();

        this.renderer = new Three.WebGLRenderer();
        this.renderer.setSize(width, height);
        document.body.appendChild(this.renderer.domElement);

        this.camera = new Three.PerspectiveCamera(
            45,
            width / height,
            0.1,
            100.0
        );

        // Basic Ecef view.
        this.camera.position.x = 5;
        this.camera.position.z = 1;
        const rot = new Three.Matrix4().multiplyMatrices(
            Mat.matrixEulerEcef4(0.0, 0.0, 0.0),
            Mat.matrixEcefToGl4()
        );
        this.camera.setRotationFromMatrix(rot);

        this.camera.updateMatrixWorld();

        const axes = new Three.AxesHelper(1.0);

        this.scene.add(axes);
    }

    public render(): void {
        this.renderer.render(this.scene, this.camera);
    }

    public resize(width: number, height: number): void {
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }

    private scene: Three.Scene;
    private renderer: Three.WebGLRenderer;
    private camera: Three.PerspectiveCamera;
}
