import * as Three from 'three';
import { GeoConvertWgs84 } from '../math/GeoConvert';
import { matrixLocalNed4 } from '../math/Matrix';

/**
 * Helper class for the visualization of relative camera orientation.
 */
export class CameraAxesHelper {
    public constructor() {
        this.converter = new GeoConvertWgs84();
        this.axes = new Three.AxesHelper(1.0);
    }

    /**
     * Update the axes given a camera.
     * @param camera The camera to update from
     */
    public updateFromCamera(camera: Three.Camera): void {
        const localNed = matrixLocalNed4(camera.position, this.converter);
        this.axes.setRotationFromMatrix(localNed);

        const axesPos = camera.position
            .clone()
            .addScaledVector(
                camera.getWorldDirection(new Three.Vector3()),
                5.0
            );
        this.axes.position.copy(axesPos);

        this.axes.updateMatrixWorld();
    }

    /**
     * Get the renderable object.
     * @returns The renderable object
     */
    public renderable(): Three.Object3D {
        return this.axes;
    }

    private converter: GeoConvertWgs84;
    private axes: Three.AxesHelper;
}
