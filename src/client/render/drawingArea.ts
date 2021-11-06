/**
 * Tuple describing a drawing area with the canvas: [x, y, width, height].
 */
export type DrawingArea = [number, number, number, number];

/**
 * Calculate a drawing area inside a canvas, constrained by the camera's
 * aspect ratio.
 * @param canvasWidth The width of the canvas
 * @param canvasHeight The height of the canvas
 * @param cameraAspectRatio The camera's aspect ratio
 * @returns The drawing area.
 */
export function calculateDrawingArea(
    canvasWidth: number,
    canvasHeight: number,
    cameraAspectRatio: number
): DrawingArea {
    const canvasAspectRatio = canvasWidth / canvasHeight;
    if (cameraAspectRatio > canvasAspectRatio) {
        // Camera is wider than canvas. Maintain width but reduce height.
        const adjHeight = canvasWidth * (1.0 / cameraAspectRatio);
        const diff = canvasHeight - adjHeight;
        return [0, diff / 2, canvasWidth, adjHeight];
    } else {
        // Camera is equal or taller than canvas. Maintain height but reduce width.
        const adjWidth = canvasHeight * cameraAspectRatio;
        const diff = canvasWidth - adjWidth;
        return [diff / 2, 0, adjWidth, canvasHeight];
    }
}

/**
 * Calculate a drawing area covering the full canvas.
 * @param canvasWidth The width of the canvas
 * @param canvasHeight The height of the canvas
 * @returns The drawing area.
 */
export function fullDrawingArea(
    canvasWidth: number,
    canvasHeight: number
): DrawingArea {
    return [0, 0, canvasWidth, canvasHeight];
}
