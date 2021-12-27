import * as Three from 'three';

import { degToRad, aspectRatioFromFov } from '../math/Helpers';
import { DrawingArea, calculateDrawingArea } from '../types/DrawingArea';
import { GeoConvertWgs84 } from '../math/GeoConvert';
import { Size } from '../types/Size';
import { Navigator } from './Navigator';
import {
    matrixEulerEcef4,
    matrixLocalNed4,
    matrixNedToGl4,
} from '../math/Matrix';

export class TrackingNavigator implements Navigator {
    public constructor(
        hFov: number,
        vFov: number,
        near: number,
        far: number,
        size: Size
    ) {
        this.size = size;
        this.camera = new Three.PerspectiveCamera(
            vFov,
            aspectRatioFromFov(degToRad(hFov), degToRad(vFov)),
            near,
            far
        );

        this.converter = new GeoConvertWgs84();
        this.setView(
            new Three.Vector3(0, 0, 100000),
            new Three.Vector3(0, -90, 0),
            new Three.Vector3(0, 0, 0),
            hFov,
            vFov
        );
    }

    public setView(
        position: Three.Vector3,
        platform: Three.Vector3,
        lever: Three.Vector3,
        hFov: number,
        vFov: number
    ): void {
        const geoc = this.converter.wgs84ToEcef(position);

        var matrix = matrixLocalNed4(geoc, this.converter);

        const platformRotation = matrixEulerEcef4(
            degToRad(platform.x),
            degToRad(platform.y),
            degToRad(platform.z)
        );
        matrix = platformRotation.premultiply(matrix);

        const leverRotation = matrixEulerEcef4(
            degToRad(lever.x),
            degToRad(lever.y),
            degToRad(lever.z)
        );
        matrix = leverRotation.premultiply(matrix);

        this.camera.position.copy(geoc);
        this.camera.setRotationFromMatrix(matrixNedToGl4().premultiply(matrix));

        this.camera.fov = vFov;
        this.camera.aspect = aspectRatioFromFov(degToRad(hFov), degToRad(vFov));
        this.updateCamera();
    }

    public setSize(size: Size): void {
        this.size = size;
    }

    public getDrawingArea(): DrawingArea {
        return calculateDrawingArea(this.size, this.camera.aspect);
    }

    public updateCamera(): void {
        this.camera.updateProjectionMatrix();
        this.camera.updateMatrixWorld();
    }

    public getCamera(): Three.PerspectiveCamera {
        return this.camera;
    }

    private size: Size;
    private camera: Three.PerspectiveCamera;
    private converter: GeoConvertWgs84;
}
