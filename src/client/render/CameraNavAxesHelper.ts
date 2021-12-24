import * as Three from 'three';
import { GeoConvertWgs84 } from '../math/GeoConvert';
import { degToRad } from '../math/Helpers';
import { matrixLocalNed4 } from '../math/Matrix';

/**
 * Helper class for the visualization of a cameras navigation axes.
 */
export class CameraNavAxesHelper {
    public constructor() {
        this.converter = new GeoConvertWgs84();
        this.axes = new Three.AxesHelper(1.0);
    }

    /**
     * Update the axes given a camera.
     * @param camera The camera to update from
     */
    public updateFromCamera(camera: Three.PerspectiveCamera): void {
        const localNed = matrixLocalNed4(camera.position, this.converter);
        this.axes.setRotationFromMatrix(localNed);

        const axesPos = camera.position
            .clone()
            .addScaledVector(
                camera.getWorldDirection(new Three.Vector3()),
                this.distance
            );
        this.axes.position.copy(axesPos);

        // Set the scale of the axes - an axis shall be a quarter of
        // the display height.
        const vFov = degToRad(camera.fov);
        const scale = (this.distance * Math.tan(vFov / 2.0)) / 2.0;
        this.axes.scale.set(scale, scale, scale);

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
    readonly distance = 5.0;
}
