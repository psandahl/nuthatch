import * as Three from 'three';

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
