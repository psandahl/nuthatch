import * as Three from 'three';
import { TetrahedronBufferGeometry } from 'three';

/**
 * The radius at the ellipsoid's equator.
 */
export const SemiMajorAxis = 6378137.0;

const InverseFlattening = 298.257223563;

/**
 * The radius at the ellipsoid's poles.
 */
export const SemiMinorAxis = SemiMajorAxis * (1.0 - 1.0 / InverseFlattening);

/**
 * Intersect the ellipsoid. No negative intersections, i.e. befind the
 * ray caster.
 * @param ray The ray
 * @returns The distance at the ray if intersection, undefined otherwise.
 */
export function intersectEllipsoid(ray: Three.Ray): number | undefined {
    const origin = new Three.Vector3(
        ray.origin.x / SemiMajorAxis,
        ray.origin.y / SemiMajorAxis,
        ray.origin.z / SemiMinorAxis
    );
    const direction = new Three.Vector3(
        ray.direction.x / SemiMajorAxis,
        ray.direction.y / SemiMajorAxis,
        ray.direction.z / SemiMinorAxis
    );

    const directionNormSq = direction.lengthSq();
    const projOrigin = origin.dot(direction) * 2.0;
    const ellipsoidToOrigin = origin.lengthSq() - 1.0;

    const d =
        projOrigin * projOrigin - 4.0 * directionNormSq * ellipsoidToOrigin;
    if (d > 0.0) {
        // Posible intersection.
        const t0 = (-projOrigin - Math.sqrt(d)) / (2.0 * directionNormSq);
        const t1 = (-projOrigin + Math.sqrt(d)) / (2.0 * directionNormSq);
        const t = Math.min(t0, t1);

        if (t >= 0.0) {
            return t;
        }
    } else if (d < 0.0) {
        // No intersection.
        return undefined;
    } else {
        // Possible tangent to ellipsoid.
        const t = -projOrigin / (2.0 * directionNormSq);
        if (t >= 0.0) {
            return t;
        }
    }

    return undefined;
}

/**
 * Get the closest surface position from the given position.
 * @param position The position above the ellipsoid
 * @returns The position at the ellipsoid surface.
 */
export function surfacePosition(position: Three.Vector3): Three.Vector3 {
    var surfPosition = new Three.Vector3(
        position.x / SemiMajorAxis,
        position.y / SemiMajorAxis,
        position.z / SemiMinorAxis
    );
    const length = surfPosition.length();

    surfPosition.x *= SemiMajorAxis;
    surfPosition.y *= SemiMajorAxis;
    surfPosition.z *= SemiMinorAxis;
    surfPosition.divideScalar(length);

    return surfPosition;
}

/**
 * Get a position's height above the ellipsoid.
 * @param position The world position
 * @returns Height above the ellipsoid.
 */
export function heightAboveEllipsoid(position: Three.Vector3): number {
    const deltaPos = new Three.Vector3().subVectors(
        position,
        surfacePosition(position)
    );
    const height = deltaPos.length();

    if (deltaPos.dot(position) < 0.0) {
        return -height;
    } else {
        return height;
    }
}
