import * as Three from 'three';

import { IntersectionPoint } from '../types/IntersectionPoint';

/**
 * Helper class for visualization of different aspects of a single surface.
 */
export class SurfaceHelper {
    constructor() {
        this.group = new Three.Group();

        this.surfaceNormal = new Three.ArrowHelper();
        this.surfaceNormal.setLength(50);
        this.surfaceNormal.setColor(0x0000ff);
        this.surfaceNormal.visible = false;
        this.group.add(this.surfaceNormal);

        this.vertexNormal = new Three.ArrowHelper();
        this.vertexNormal.setLength(50);
        this.vertexNormal.setColor(0xffff00);
        this.vertexNormal.visible = false;
        this.group.add(this.vertexNormal);
    }

    /**
     * Update the surface helper.
     * @param intersection An intersection pointvvv
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
    }

    /**
     * Get the renderable group.
     * @returns The renderable group
     */
    public renderable(): Three.Group {
        return this.group;
    }

    private group: Three.Group;
    private surfaceNormal: Three.ArrowHelper;
    private vertexNormal: Three.ArrowHelper;
}
