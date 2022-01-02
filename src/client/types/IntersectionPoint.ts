import * as Three from 'three';

/**
 * Data for an intersection point.
 */
export class IntersectionPoint {
    constructor(distance: number, point: Three.Vector3) {
        this.distance = distance;
        this.point = point;
    }

    /**
     * The distance from the origin to the intersection.
     */
    public distance: number;

    /**
     * The intersection point.
     */
    public point: Three.Vector3;

    /**
     * Optional: Vertex 0 of the face.
     */
    public vertex0?: Three.Vector3;

    /**
     * Optional: Vertex 1 of the face.
     */
    public vertex1?: Three.Vector3;

    /**
     * Optional: Vertex 2 of the face.
     */
    public vertex2?: Three.Vector3;

    /**
     * Optional: Surface normal.
     */
    public surfaceNormal?: Three.Vector3;

    /**
     * Optional: Vertex normal.
     */
    public vertexNormal?: Three.Vector3;
}
