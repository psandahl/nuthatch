import * as Three from 'three';

import { DrawingArea, fullDrawingArea } from './DrawingArea';
import { matrixNedToGl4, matrixLookAtNed4 } from '../math/Matrix';
import { WorldNavigator } from './WorldNavigator';

export class ExploringWorldNavigator implements WorldNavigator {
    /**
     * Construct a
     * @param vFov Vertical field of view (degrees)
     * @param near Near plane
     * @param far Far plane
     * @param canvas The rendering canvas
     */
    constructor(
        vFov: number,
        near: number,
        far: number,
        canvas: HTMLCanvasElement
    ) {
        this.width = canvas.width;
        this.height = canvas.height;
        this.camera = new Three.PerspectiveCamera(
            vFov,
            canvas.width / canvas.height,
            near,
            far
        );
        this.camera.updateProjectionMatrix();

        this.position = new Three.Vector3();
        this.orientation = new Three.Matrix4();
        this.lookAt(
            new Three.Vector3(5, 0, 0),
            new Three.Vector3(0, 0, 0),
            new Three.Vector3(0, 0, 1)
        );
        this.updateCamera();
    }

    public setView(
        position: Three.Vector3,
        orientation: Three.Vector3,
        hFov: number,
        vFov: number
    ): void {
        console.warn('setView is not implemented in ExploringWorldNavigator');
    }

    public lookAt(
        position: Three.Vector3,
        at: Three.Vector3,
        up: Three.Vector3
    ): void {
        this.position = position;
        this.orientation = matrixLookAtNed4(position, at, up);
    }

    public setSize(width: number, height: number): void {
        this.width = width;
        this.height = height;
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
    }

    public getDrawingArea(): DrawingArea {
        return fullDrawingArea(this.width, this.height);
    }

    public updateCamera(): void {
        this.camera.position.set(
            this.position.x,
            this.position.y,
            this.position.z
        );

        const matrix = new Three.Matrix4().multiplyMatrices(
            this.orientation,
            matrixNedToGl4()
        );
        this.camera.setRotationFromMatrix(matrix);
        this.camera.updateMatrixWorld();
    }

    public getCamera(): Three.PerspectiveCamera {
        return this.camera;
    }

    private width: number;
    private height: number;

    private camera: Three.PerspectiveCamera;

    // The navigators ECEF position.
    private position: Three.Vector3;

    // Matrix carrying the orientation for the navigator. It's a NED matrix
    // operating within an ECEF frame.
    private orientation: Three.Matrix4;
}
