import * as Three from 'three';

import { DrawingArea } from '../types/DrawingArea';
import { Size } from '../types/Size';

/**
 * Common interface contract for a world navigator.
 */
export interface WorldNavigator {
    /**
     * Set the view for the navigator (usable for a camera tracking navigator).
     * @param position The Wgs84 position for the navigator
     * @param platform The Wgs84 platform orientation for the navigator (degrees)
     * @param lever The Wgs84 lever orientation for the navigator (degrees)
     * @param hFov The horizontal field of view (degrees)
     * @param vFov The vertical field of view (degrees)
     */
    setView(
        position: Three.Vector3,
        platform: Three.Vector3,
        lever: Three.Vector3,
        hFov: number,
        vFov: number
    ): void;

    /**
     * Set the view for the navigator (usable as starting point for an
     * orbiting navigator).
     * @param position The ECEF for the navigator
     * @param at The ECEF position where to look
     * @param up The ECEF up direction
     */
    lookAt(position: Three.Vector3, at: Three.Vector3, up: Three.Vector3): void;

    /**
     * Notification that the rendering canvas' size has changed. For an orbiting
     * navigator it may result in change of aspect ratio and for a tracking
     * navigator it may result in change of the drawing area.
     * @param size The new size
     */
    setSize(size: Size): void;

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
}
