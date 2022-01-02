import * as Three from 'three';

import { CameraNavAxesHelper } from './CameraNavAxesHelper';
import { IntersectionPoint } from '../types/IntersectionPoint';

/**
 * Class that maintains annotations.
 */
export class Annotations {
    constructor() {
        this.scene = new Three.Scene();

        this.cameraNavAxesHelper = new CameraNavAxesHelper();
        this.scene.add(this.cameraNavAxesHelper.renderable());

        this.surfaceNormal = new Three.ArrowHelper();
        this.surfaceNormal.setLength(50);
        this.surfaceNormal.setColor(0x0000ff);
        this.scene.add(this.surfaceNormal);

        this.vertexNormal = new Three.ArrowHelper();
        this.vertexNormal.setLength(50);
        this.vertexNormal.setColor(0xffff00);
        this.scene.add(this.vertexNormal);
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
        this.cameraNavAxesHelper.updateFromCamera(camera);
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
    private surfaceNormal: Three.ArrowHelper;
    private vertexNormal: Three.ArrowHelper;
}
