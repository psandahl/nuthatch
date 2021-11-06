import * as Three from 'three';
import { degToRad, radToDeg } from 'three/src/math/MathUtils';

import { aspectRatioFromFov } from '../math/helpers';

/**
 * Mode of the camera; adapting to the canvas or strictly adapting
 * to the camera metadata.
 */
export enum CameraMode {
    CanvasAdapting,
    CameraAdapting,
}

/**
 * A perspective camera specialized for rendering the scene. It can either
 * be adapted to have its aspect ratio from the canvas or the camera metadata.
 */
export class SceneCamera extends Three.PerspectiveCamera {
    /**
     * Construct the SceneCamera.
     * @param mode The initial mode, default is CanvasAdapting
     */
    constructor(mode: CameraMode = CameraMode.CanvasAdapting) {
        super(50.0, 1.0, 0.1, 2000);
        this.mode = mode;
        this.hFov = degToRad(50.0);
        this.vFov = degToRad(50.0);
        this.canvasWidth = 1.0;
        this.canvasHeight = 1.0;
    }

    /**
     * Notify the camera about the changed canvas size.
     * @param canvasWidth The new canvas width
     * @param canvasHeight The new canvas height
     */
    public resize(canvasWidth: number, canvasHeight: number): void {
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        if (this.mode == CameraMode.CanvasAdapting) {
            // Only change aspect ratio if in canvas adapting mode.
            this.aspect = canvasWidth / canvasHeight;
            this.updateProjectionMatrix();
        }
    }

    /**
     * Get the current mode.
     * @returns The mode
     */
    public getMode(): CameraMode {
        return this.mode;
    }

    /**
     * Change the mode for the camera.
     * @param mode The mode
     */
    public setMode(mode: CameraMode): void {
        if (this.mode != mode) {
            // Make sure we are switching mode.
            this.mode = mode;
            switch (mode) {
                case CameraMode.CanvasAdapting:
                    this.aspect = this.canvasWidth / this.canvasHeight;
                    break;
                case CameraMode.CameraAdapting:
                    this.aspect = aspectRatioFromFov(this.hFov, this.vFov);
                    break;
            }
            this.updateProjectionMatrix();
        }
    }

    /**
     * Get the current field of view.
     * @returns The current field of view in radians [hFov, vFov]
     */
    public getFov(): [number, number] {
        return [this.hFov, this.vFov];
    }

    /**
     * Change the field of view.
     * @param hFov Horizontal field of view in radians
     * @param vFov Vertical field of view in radians
     */
    public setFov(hFov: number, vFov: number): void {
        this.fov = radToDeg(vFov);
        this.hFov = hFov;
        this.vFov = vFov;
        if (this.mode == CameraMode.CameraAdapting) {
            // Only change aspect ratio if in camera adapting mode.
            this.aspect = aspectRatioFromFov(hFov, vFov);
        }
        this.updateProjectionMatrix();
    }

    /**
     * Get the current aspect ratio for the camera.
     * @returns The aspect ratio
     */
    public getAspectRatio(): number {
        return this.aspect;
    }

    /**
     * Get the current view range.
     * @returns The current view range [near, far]
     */
    public getViewRange(): [number, number] {
        return [this.near, this.far];
    }

    /**
     * Change the view range.
     * @param near The new near distance
     * @param far The new far distance
     */
    public setViewRange(near: number, far: number): void {
        this.near = near;
        this.far = far;
        this.updateProjectionMatrix();
    }

    private mode: CameraMode;
    private hFov: number;
    private vFov: number;
    private canvasWidth: number;
    private canvasHeight: number;
}
