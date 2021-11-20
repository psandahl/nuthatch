import * as Three from 'three';

import { DrawingArea } from './DrawingArea';

/**
 * Common interface contract for a world navigator.
 */
export interface WorldNavigator {
    /**
     * Set the view for the navigator (usable for a tracking navigator).
     * @param position The ECEF position for the navigator
     * @param orientation The ECEF orientation for the navigator (radians)
     * @param hFov The horizontal field of view (radians)
     * @param vFov The vertical field of view (radians)
     */
    setView(
        position: Three.Vector3,
        orientation: Three.Vector3,
        hFov: number,
        vFov: number
    ): void;

    /**
     * Set the view for the navigator (usable as starting point for an
     * exploring navigator).
     * @param position The ECEF for the navigator
     * @param at The ECEF position where to look
     * @param up The ECEF up direction
     */
    lookAt(position: Three.Vector3, at: Three.Vector3, up: Three.Vector3): void;

    /**
     * Notification that the rendering canvas' size has changed. Mostly usable
     * for an exploring navigator, to change aspect ratio).
     * @param width The new width for the rendering canvas
     * @param height The new height for the rendering canvas
     */
    setSize(width: number, height: number): void;

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
