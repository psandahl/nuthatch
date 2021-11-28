import { Size } from './Size';

/**
 * Tuple describing a drawing area with the canvas: [x, y, width, height].
 */
export type DrawingArea = [number, number, number, number];

/**
 * Calculate a drawing area inside a canvas, constrained by the camera's
 * aspect ratio.
 * @param size The size of the canvas
 * @param cameraAspectRatio The camera's aspect ratio
 * @returns The drawing area.
 */
export function calculateDrawingArea(
    size: Size,
    cameraAspectRatio: number
): DrawingArea {
    const [width, height] = size;
    const canvasAspectRatio = width / height;
    if (cameraAspectRatio > canvasAspectRatio) {
        // Camera is wider than canvas. Maintain width but reduce height.
        const adjHeight = width * (1.0 / cameraAspectRatio);
        const diff = height - adjHeight;
        return [0, diff / 2, width, adjHeight];
    } else {
        // Camera is equal or taller than canvas. Maintain height but reduce width.
        const adjWidth = height * cameraAspectRatio;
        const diff = width - adjWidth;
        return [diff / 2, 0, adjWidth, height];
    }
}

/**
 * Calculate a drawing area covering the full canvas.
 * @param size The size of the canvas
 * @returns The drawing area.
 */
export function fullDrawingArea(size: Size): DrawingArea {
    const [width, height] = size;
    return [0, 0, width, height];
}
