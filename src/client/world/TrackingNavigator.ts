import * as Three from 'three';

import { degToRad, aspectRatioFromFov } from '../math/Helpers';
import { DrawingArea, calculateDrawingArea } from '../types/DrawingArea';
import { GeoConvertWgs84 } from '../math/GeoConvert';
import { Size } from '../types/Size';
import { Navigator } from './Navigator';
import {
    extractBasis,
    matrixEulerEcef4,
    matrixLocalNed4,
    matrixNedToGl4,
} from '../math/Matrix';
import { Camera } from '../types/TrackingCamera';
import { pxToUv, uvToWorldRay } from '../math/CameraTransforms';

/**
 * A tracking navigator implementing the Navigator interface.
 * A tracking navigator is strictly following commands.
 */
export class TrackingNavigator implements Navigator {
    /**
     * Create a new tracking navigator.
     * @param hFov Initial horizontal field of view (degrees)
     * @param vFov Initial vertical field of view (degrees)
     * @param near Near plane
     * @param far Far plane
     * @param size Initial size of the rendering target
     */
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

    /**
     * Set the navigator's view.
     * @param position Geodetic (WGS84) position
     * @param platform Geodetic (WGS84) platform orientation
     * @param lever Relative orientation for lever arm
     * @param hFov Horizontal field of view (degrees)
     * @param vFov Vertical field of view (degrees)
     */
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

    /**
     * Set view from a tracking camera.
     * @param camera A tracking camera
     */
    public setViewFromTrackingCamera(camera: Camera): void {
        this.setView(
            new Three.Vector3(
                camera.position.x,
                camera.position.y,
                camera.position.z
            ),
            new Three.Vector3(
                camera.platform.yaw,
                camera.platform.roll,
                camera.platform.roll
            ),
            new Three.Vector3(
                camera.lever.yaw,
                camera.lever.pitch,
                camera.lever.roll
            ),
            camera.fov.hfov,
            camera.fov.vfov
        );
    }

    /**
     * Get look at parameters in ECEF space from the navigator.
     * @returns A tuple [position, at, up]
     */
    public getLookAt(): [Three.Vector3, Three.Vector3, Three.Vector3] {
        // Get a NED matrix from camera and extract its basis vectors.
        const gl4ToNed = matrixNedToGl4().transpose();
        const [front, _right, down] = extractBasis(
            gl4ToNed.premultiply(this.camera.matrixWorld)
        );

        return [
            this.camera.position.clone(),
            this.camera.position.clone().addScaledVector(front, 1.0),
            down.negate(),
        ];
    }

    /**
     * Set the size for the rendering target.
     * @param size The new size
     */
    public setSize(size: Size): void {
        this.size = size;
    }

    /**
     * Get the current size.
     * @returns The size
     */
    public getSize(): Size {
        return this.size;
    }

    /**
     * Get the drawing area.
     * @returns The drawing area
     */
    public getDrawingArea(): DrawingArea {
        return calculateDrawingArea(this.size, this.camera.aspect);
    }

    /**
     * Update the camera matrices.
     */
    public updateCamera(): void {
        this.camera.updateProjectionMatrix();
        this.camera.updateMatrixWorld();
    }

    /**
     * Get the perspective camera from the navigator.
     * @returns The perspective camera
     */
    public getCamera(): Three.PerspectiveCamera {
        return this.camera;
    }

    /**
     * Get a world ray for the given pixel.
     * @param px The px to be given a ray
     * @returns The world ray, or undefined
     */
    public getWorldRay(px: Three.Vector2 | undefined): Three.Ray | undefined {
        if (!px) {
            return undefined;
        }

        const uv = pxToUv(this.getDrawingArea(), px);
        if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) {
            return undefined;
        } else {
            return uvToWorldRay(
                this.camera.projectionMatrixInverse,
                this.camera.matrixWorld,
                uv
            );
        }
    }

    private size: Size;
    private camera: Three.PerspectiveCamera;
    private converter: GeoConvertWgs84;
}
