import * as Three from 'three';

/**
 * Convert from degrees to radians.
 * @param deg Angle in degrees
 * @returns Angle in radians
 */
export function degToRad(deg: number): number {
    return deg * (Math.PI / 180.0);
}

/**
 * Convert from radians to degrees.
 * @param rad Angle in radians
 * @returns Angle in degrees.
 */
export function radToDeg(rad: number): number {
    return rad / (Math.PI / 180.0);
}

/**
 * Calculate aspect ratio from field of view values.
 * @param hFov The horizontal field of view in radians
 * @param vFov The vertical field of view in radians
 * @returns The aspect ratio.
 */
export function aspectRatioFromFov(hFov: number, vFov: number): number {
    const width = Math.tan(hFov / 2.0);
    const height = Math.tan(vFov / 2.0);

    return width / height;
}

/**
 * Convert from UV coordinates to NDC coordinates.
 * @param uv UV coordinate
 * @returns NDC coordinate.
 */
export function uvToNdc(uv: Three.Vector2): Three.Vector2 {
    return uv.clone().multiplyScalar(2.0).subScalar(1.0);
}

/**
 * Convert from NDC coordinates to UV coordinates.
 * @param ndc NDC coordinate
 * @returns UV coordinate.
 */
export function ndcToUv(ndc: Three.Vector2): Three.Vector2 {
    return ndc.clone().addScalar(1.0).multiplyScalar(0.5);
}

/**
 * Undistort a UV coordinate.
 * @param projection The projection matrix
 * @param inverseProjection The inverse projection matrix
 * @param uv The distorted UV coordinate
 * @param coeff The distortion coefficients k2, k3 and k4
 * @returns The undistorted UV coordinate.
 */
export function undistortUv(
    projection: Three.Matrix4,
    inverseProjection: Three.Matrix4,
    uv: Three.Vector2,
    coeff: Three.Vector3
): Three.Vector2 {
    const ndc2 = uvToNdc(uv);
    const ndc = new Three.Vector3(ndc2.x, ndc2.y, 1.0);

    const cam = ndc.applyMatrix4(inverseProjection);
    // Normalize by length.
    cam.multiplyScalar(1.0 / cam.z);

    const r = Math.hypot(cam.x, cam.y);
    const r2 = r * r;
    const r3 = r2 * r;
    const r4 = r2 * r2;

    const k2 = coeff.x;
    const k3 = coeff.y;
    const k4 = coeff.z;

    const scale = 1.0 + (r2 * k2 + r3 * k3 + r4 * k4);
    cam.multiplyScalar(scale);

    // Set depth to 1.
    cam.z = 1.0;

    const adjNdc = cam.applyMatrix4(projection);
    return ndcToUv(new Three.Vector2(adjNdc.x, adjNdc.y));
}
