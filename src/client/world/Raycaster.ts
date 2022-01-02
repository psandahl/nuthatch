import * as Three from 'three';

import { IntersectionPoint } from '../types/IntersectionPoint';

/**
 * Raycaster convenience class.
 */
export class Raycaster {
    /**
     * Create a raycaster.
     * @param scene The scene used for intersection
     */
    constructor(scene: Three.Scene) {
        this.scene = scene;
        this.rayCaster = new Three.Raycaster();

        this.rayCaster.params.Mesh = { threshold: 1 };
        console.log(this.rayCaster.params);
    }

    /**
     * Intersect the scene with the given ray.
     * @param ray The ray for the intersect
     * @returns Maybe an intersection.
     */
    public intersect(
        ray: Three.Ray | undefined
    ): IntersectionPoint | undefined {
        if (ray) {
            this.rayCaster.ray.copy(ray);
            const intersections = this.rayCaster.intersectObjects(
                this.scene.children
            );
            if (intersections.length > 0) {
                return this.processIntersection(ray, intersections[0]);
            }
        }

        return undefined;
    }

    private processIntersection(
        ray: Three.Ray,
        intersection: Three.Intersection
    ): IntersectionPoint {
        var point = new IntersectionPoint(
            intersection.distance,
            ray.at(intersection.distance, new Three.Vector3())
        );

        if (intersection.face && intersection.object instanceof Three.Mesh) {
            const mesh = intersection.object as Three.Mesh;
            if (
                mesh.geometry.hasAttribute('position') &&
                mesh.geometry.getAttribute('position').itemSize == 3
            ) {
                const position = mesh.geometry.getAttribute('position');

                const vertices = [
                    intersection.face.a,
                    intersection.face.b,
                    intersection.face.c,
                ].map((index) => {
                    return mesh.localToWorld(
                        new Three.Vector3(
                            position.getX(index),
                            position.getY(index),
                            position.getZ(index)
                        )
                    );
                });

                const vec0 = new Three.Vector3()
                    .subVectors(vertices[0], vertices[2])
                    .normalize();
                const vec1 = new Three.Vector3()
                    .subVectors(vertices[1], vertices[2])
                    .normalize();

                const surfaceNormal = new Three.Vector3().crossVectors(
                    vec0,
                    vec1
                );

                point.vertex0 = vertices[0];
                point.vertex1 = vertices[1];
                point.vertex2 = vertices[2];

                point.surfaceNormal = surfaceNormal;
                point.vertexNormal = intersection.face.normal;
            }
        }

        return point;
    }

    private scene: Three.Scene;
    private rayCaster: Three.Raycaster;
}
