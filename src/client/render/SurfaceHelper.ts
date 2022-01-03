import * as Three from 'three';
import { degToRad } from '../math/Helpers';

import { IntersectionPoint } from '../types/IntersectionPoint';

/**
 * Helper class for visualization of different aspects of a single surface.
 */
export class SurfaceHelper {
    constructor() {
        this.group = new Three.Group();

        this.surfaceNormal = new Three.ArrowHelper();
        this.surfaceNormal.setLength(1);
        this.surfaceNormal.setColor(0x0000ff);
        this.surfaceNormal.visible = false;
        this.group.add(this.surfaceNormal);

        const lineGeometry = new Three.BufferGeometry().setFromPoints([
            new Three.Vector3(),
            new Three.Vector3(),
            new Three.Vector3(),
            new Three.Vector3(),
        ]);
        const lineMaterial = new Three.LineBasicMaterial();
        this.triangle = new Three.Line(lineGeometry, lineMaterial);
        this.triangle.visible = false;
        this.group.add(this.triangle);

        this.group.raycast = (
            raycaster: Three.Raycaster,
            intersects: Three.Intersection<Three.Object3D<Three.Event>>[]
        ): void => {};
    }

    /**
     * Update the surface helper.
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

                // Always set the length for the normal to be 1/8 of screen height.
                const length =
                    (intersection.distance *
                        Math.tan(degToRad(camera.fov / 2.0))) /
                    4.0;
                this.surfaceNormal.setLength(length);

                this.surfaceNormal.visible = true;
            }

            if (
                intersection.vertex0 &&
                intersection.vertex1 &&
                intersection.vertex2
            ) {
                this.triangle.geometry.setFromPoints([
                    intersection.vertex0,
                    intersection.vertex1,
                    intersection.vertex2,
                    intersection.vertex0,
                ]);
                this.triangle.geometry.computeBoundingSphere();
                this.triangle.visible = true;
            }
        } else {
            this.surfaceNormal.visible = false;
            this.triangle.visible = false;
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
    private triangle: Three.Line;
}
