import * as Three from 'three';

import { DrawingArea, fullDrawingArea } from './DrawingArea';
import { matrixEulerEcef4, matrixEcefToGl4 } from '../math/Matrix';
import { WorldNavigator } from './WorldNavigator';

/**
 * A mouse navigator for navigating the terrain. Navigates in ECEF.
 */
export class MouseTerrainNavigator implements WorldNavigator {
    /**
     * Construct a new mouse terrain navigator.
     * @param vFov Vertical field of view - in degrees
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
        this.position = new Three.Vector3(0.0, 0.0, 0.0);
        this.orientation = new Three.Vector3(0.0, 0.0, 0.0);
        this.ecefRotation = matrixEulerEcef4(
            this.orientation.x,
            this.orientation.y,
            this.orientation.z
        );

        canvas.onwheel = this.wheelHandler.bind(this);
    }

    /**
     * Set the camera's pose.
     * @param position The ECEF position of the camera
     * @param orientation The ECEF Euler angles for the camera
     */
    public setView(
        position: Three.Vector3,
        orientation: Three.Vector3,
        hFov: number,
        vFov: number
    ): void {
        this.position = position;
        this.orientation = orientation;
        this.ecefRotation = matrixEulerEcef4(
            this.orientation.x,
            this.orientation.y,
            this.orientation.z
        );
    }

    /**
     * Set the camera's pose from a look at.
     * @param position The ECEF position of the camera
     * @param at The ECEF position where the camera is looking
     * @param up The up direction
     */
    public lookAt(
        position: Three.Vector3,
        at: Three.Vector3,
        up: Three.Vector3
    ): void {}

    /**
     * Set a new size for the rendering canvas (impacts aspect ratio).
     * @param width The new width
     * @param height The new height
     */
    public setSize(width: number, height: number): void {
        this.width = width;
        this.height = height;
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
    }

    /**
     * Get the drawing area for the navigator.
     * @returns The drawing area.
     */
    public getDrawingArea(): DrawingArea {
        return fullDrawingArea(this.width, this.height);
    }

    /**
     * Update the camera's world matrix. Must be done before rendering.
     */
    public updateCamera(): void {
        this.camera.position.set(
            this.position.x,
            this.position.y,
            this.position.z
        );
        const m = new Three.Matrix4().multiplyMatrices(
            this.ecefRotation,
            matrixEcefToGl4()
        );
        this.camera.setRotationFromMatrix(m);
        this.camera.updateMatrixWorld();
    }

    /**
     * Get the navigators perspective camera.
     * @returns The perspective camera
     */
    public getCamera(): Three.PerspectiveCamera {
        return this.camera;
    }

    /**
     * The wheel event handler.
     * @param event The wheel event
     */
    private wheelHandler(event: WheelEvent): void {
        event.preventDefault();

        const forward = event.deltaY < 0;
        const stride = forward ? 1.0 : -1.0;

        this.position.addScaledVector(this.ecefForwardDirection(), stride);
    }

    /**
     * Get the forward direction.
     * @returns The forward direction
     */
    private ecefForwardDirection(): Three.Vector3 {
        const x = new Three.Vector3();
        const y = new Three.Vector3();
        const z = new Three.Vector3();
        this.ecefRotation.extractBasis(x, y, z);

        return x.negate();
    }

    private width: number;
    private height: number;
    private camera: Three.PerspectiveCamera;
    private position: Three.Vector3;
    private orientation: Three.Vector3;
    private ecefRotation: Three.Matrix4;
}
