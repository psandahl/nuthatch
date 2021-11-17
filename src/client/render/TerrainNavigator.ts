import * as Three from 'three';

/**
 * Interface contract for a terrain navigator.
 */
export interface TerrainNavigator {
    setPose(position: Three.Vector3, orientation: Three.Vector3): void;
    lookAt(position: Three.Vector3, at: Three.Vector3, up: Three.Vector3): void;
    setSize(width: number, height: number): void;
    updateCamera(): void;
    getCamera(): Three.PerspectiveCamera;
}
