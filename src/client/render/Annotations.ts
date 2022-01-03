import * as Three from 'three';

import { CameraNavAxesHelper } from './CameraNavAxesHelper';
import { IntersectionPoint } from '../types/IntersectionPoint';
import { SurfaceHelper } from './SurfaceHelper';

/**
 * Class that maintains annotations.
 */
export class Annotations {
    constructor() {
        this.scene = new Three.Scene();

        this.cameraNavAxesHelper = new CameraNavAxesHelper();
        this.scene.add(this.cameraNavAxesHelper.renderable());

        this.surfaceHelper = new SurfaceHelper();
        this.scene.add(this.surfaceHelper.renderable());
    }

    /**
     * Update the annotations.
     * @param intersection An intersection point
     * @param camera A perspective camera
     */
    public update(
        intersection: IntersectionPoint | undefined,
        camera: Three.PerspectiveCamera
    ): void {
        if (this.cameraNavAxesHelper.renderable().visible) {
            this.cameraNavAxesHelper.updateFromCamera(camera);
        }
        this.surfaceHelper.update(intersection, camera);
    }

    /**
     * Toggle the camera nav axes.
     */
    public toggleCameraNavAxes(): void {
        this.cameraNavAxesHelper.renderable().visible =
            !this.cameraNavAxesHelper.renderable().visible;
    }

    /**
     * Get reference to the annotation's scene object.
     * @returns The scene
     */
    public getScene(): Three.Scene {
        return this.scene;
    }

    private scene: Three.Scene;
    private cameraNavAxesHelper: CameraNavAxesHelper;
    private surfaceHelper: SurfaceHelper;
}
