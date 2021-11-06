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
