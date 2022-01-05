import * as Three from 'three';

import { DrawingArea } from '../types/DrawingArea';

/**
 * Translate from pixel to UV.
 * @param area The drawing area
 * @param px The pixel
 * @returns The UV coordinate.
 */
export function pxToUv(area: DrawingArea, px: Three.Vector2): Three.Vector2 {
    const [xoffs, yoffs, width, height] = area;
    const u = (px.x - xoffs) / (width - 1.0);
    const v = 1.0 - (px.y - yoffs) / (height - 1.0);

    return new Three.Vector2(u, v);
}

/**
 * Translate from UV to pixel.
 * @param area The drawing area
 * @param uv The UV coordinate
 * @returns The pixel.
 */
export function uvToPx(area: DrawingArea, uv: Three.Vector2): Three.Vector2 {
    const [xoffs, yoffs, width, height] = area;
    const x = uv.x * (width - 1.0);
    const y = (1.0 - uv.y) * (height - 1.0);

    return new Three.Vector2(x + xoffs, y + yoffs);
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
 * Generate a camera space ray.
 * @param inverseProjection The inverse projection matrix
 * @param uv UV coordinate
 * @returns A camera space ray.
 */
export function uvToCameraRay(
    inverseProjection: Three.Matrix4,
    uv: Three.Vector2
): Three.Ray {
    const ndc2 = uvToNdc(uv);
    const ndc = new Three.Vector3(ndc2.x, ndc2.y, 1.0);
    const cam = ndc.applyMatrix4(inverseProjection);

    return new Three.Ray(new Three.Vector3(0, 0, 0), cam.normalize());
}

/**
 * Generate a world space ray.
 * @param inverseProjection The inverse projection matrix
 * @param worldmatrix The world matrix
 * @param uv UV coordinate
 * @returns A world space ray.
 */
export function uvToWorldRay(
    inverseProjection: Three.Matrix4,
    worldMatrix: Three.Matrix4,
    uv: Three.Vector2
): Three.Ray {
    return uvToCameraRay(inverseProjection, uv).applyMatrix4(worldMatrix);
}

/**
 * Generate a world space ray.
 * @param camera The perspective camera
 * @param area The drawing area
 * @param px The pixel coordinate
 * @returns A world space ray.
 */
export function pxToWorldRay(
    camera: Three.PerspectiveCamera,
    area: DrawingArea,
    px: Three.Vector2
): Three.Ray {
    return uvToWorldRay(
        camera.projectionMatrixInverse,
        camera.matrixWorld,
        pxToUv(area, px)
    );
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

/**
 * Calculate logaritmic depth as a shader would do.
 * @param viewZ The view view space depth (negative or positive)
 * @param far The camera far plane
 * @returns The logarithmic depth.
 */
export function viewZToLogDepth(viewZ: number, far: number): number {
    // For the calculations, the view depth is assumed to be positive.
    viewZ = Math.abs(viewZ);
    return Math.log2(viewZ + 1.0) / Math.log2(far + 1.0);
}

/**
 * Reconstruct the view space depth from logaritmic value.
 * @param fragDepth The logarithmic depth for a fragment
 * @param far The camera far plane
 * @returns The view space depth (always positive)
 */
export function logDepthToInvViewZ(fragDepth: number, far: number): number {
    // Inverse calculation from viewZ to log depth.
    const logDepth = fragDepth * Math.log2(far + 1.0);
    return Math.pow(2, logDepth) - 1.0; // exp2(logDepth)
}
