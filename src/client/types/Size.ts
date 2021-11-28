/**
 * Tuple describing a size in width and height.
 */
export type Size = [number, number];

/**
 * Get the size of the window object.
 * @returns The window size.
 */
export function windowSize(): Size {
    return [window.innerWidth, window.innerHeight];
}
