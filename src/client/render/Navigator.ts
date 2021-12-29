import * as Three from 'three';

import { DrawingArea } from '../types/DrawingArea';
import { Size } from '../types/Size';

/**
 * Common interface contract for a navigator.
 */
export interface Navigator {
    /**
     * Notification that the rendering canvas' size has changed. For an orbiting
     * navigator it may result in change of aspect ratio and for a tracking
     * navigator it may result in change of the drawing area.
     * @param size The new size
     */
    setSize(size: Size): void;

    /**
     * Get the current size from the navigator.
     */
    getSize(): Size;

    /**
     * Report the navigator's drawing area (may have changed after a setSize).
     */
    getDrawingArea(): DrawingArea;

    /**
     * Update the navigator's perspective camera (should be
     * called before rendering).
     */
    updateCamera(): void;

    /**
     * Get a reference to the navigator's perspective camera.
     */
    getCamera(): Three.PerspectiveCamera;

    /**
     * Get a world ray for the given pixel location. If the pixel
     * lies outside the drawing area the value of undefined is
     * returned.
     * @param px Pixel location
     */
    getWorldRay(px: Three.Vector2): Three.Ray | undefined;
}
