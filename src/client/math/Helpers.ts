export const NearPlane = 0.1;
export const FarPlane = 1000000000;

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
