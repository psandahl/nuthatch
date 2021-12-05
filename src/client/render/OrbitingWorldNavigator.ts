import * as Three from 'three';

import { DrawingArea, fullDrawingArea } from '../types/DrawingArea';
import { pxToUv, pxToWorldRay } from '../math/CameraTransforms';
import {
    heightAboveEllipsoid,
    intersectEllipsoid,
    SemiMajorAxis,
} from '../math/Ellipsoid';
import { extractBasis, matrixLocalNed4, matrixNedToGl4 } from '../math/Matrix';
import { Size } from '../types/Size';
import { WorldNavigator } from './WorldNavigator';
import { degToRad, radToDeg } from '../math/Helpers';
import { GeoConvert } from '../math/GeoConvert';

export class OrbitingWorldNavigator implements WorldNavigator {
    /**
     * Construct a
     * @param vFov Vertical field of view (degrees)
     * @param near Near plane
     * @param far Far plane
     * @param canvas The rendering canvas
     */
    constructor(
        vFov: number,
        near: number,
        far: number,
        canvas: HTMLCanvasElement
    ) {
        this.size = [canvas.width, canvas.height];
        this.camera = new Three.PerspectiveCamera(
            vFov,
            canvas.width / canvas.height,
            near,
            far
        );
        this.camera.updateProjectionMatrix();

        this.converter = new GeoConvert();

        this.position = new Three.Vector3();
        this.orientation = new Three.Matrix4();

        this.tiltedAt(new Three.Vector3(SemiMajorAxis * 3, 0.0, 0.0));
        this.updateCamera();

        this.panMousePosition = undefined;
        this.rotateMousePosition = undefined;
        this.rotateAnchorPosition = undefined;

        // Set mouse listeners.
        canvas.onwheel = this.onWheel.bind(this);
        canvas.onmousedown = this.onMouseDown.bind(this);
        canvas.onmouseup = this.onMouseUp.bind(this);
        canvas.onmousemove = this.onMouseMove.bind(this);
        canvas.onmouseleave = this.onMouseLeave.bind(this);
        canvas.oncontextmenu = (event: MouseEvent) => {
            event.preventDefault();
        };
    }

    public setView(
        position: Three.Vector3,
        orientation: Three.Vector3,
        hFov: number,
        vFov: number
    ): void {
        console.warn('setView is not implemented in ExploringWorldNavigator');
    }

    public lookAt(
        position: Three.Vector3,
        at: Three.Vector3,
        up: Three.Vector3
    ): void {
        this.position = position;
        this.orientation = new Three.Matrix4().lookAt(position, at, up);
    }

    public neutralAt(position: Three.Vector3): void {
        this.at(position, 0);
    }

    public tiltedAt(position: Three.Vector3): void {
        this.at(position, -Math.PI / 2.0);
    }

    public setSize(size: Size): void {
        this.size = size;
        const [width, height] = size;
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
    }

    public getDrawingArea(): DrawingArea {
        return fullDrawingArea(this.size);
    }

    public updateCamera(): void {
        this.camera.position.set(
            this.position.x,
            this.position.y,
            this.position.z
        );

        this.camera.setRotationFromMatrix(this.orientation);
        this.camera.updateMatrixWorld();
    }

    public getCamera(): Three.PerspectiveCamera {
        return this.camera;
    }

    private at(position: Three.Vector3, tiltAngle: number): void {
        var matrix = matrixNedToGl4().premultiply(
            matrixLocalNed4(position, this.converter)
        );

        const [camX, _camY, _camZ] = extractBasis(matrix);
        const tiltMatrix = new Three.Matrix4().makeRotationAxis(
            camX,
            tiltAngle
        );

        this.position = position;
        this.orientation = matrix.premultiply(tiltMatrix);
    }

    private onWheel(event: WheelEvent): void {
        event.preventDefault();

        const stride = Math.max(
            1.0,
            heightAboveEllipsoid(this.position) / 10.0
        );
        const direction = event.deltaY < 0 ? 1.0 : -1.0;
        this.position.addScaledVector(
            this.camera.getWorldDirection(new Three.Vector3()),
            direction * stride
        );
    }

    private onMouseDown(event: MouseEvent): void {
        event.preventDefault();

        if (event.button === 0) {
            this.panMousePosition = new Three.Vector2(
                event.clientX,
                event.clientY
            );
        } else if (event.button === 2) {
            const px = new Three.Vector2(event.clientX, event.clientY);
            const ray = pxToWorldRay(this.camera, this.size, px);
            const t = intersectEllipsoid(ray);
            if (t) {
                this.rotateMousePosition = px;
                this.rotateAnchorPosition = ray.at(t, new Three.Vector3());
            }
        }
    }

    private onMouseUp(event: MouseEvent): void {
        event.preventDefault();

        if (event.button === 0) {
            this.panMousePosition = undefined;
        } else if (event.button === 2) {
            this.rotateMousePosition = undefined;
            this.rotateAnchorPosition = undefined;
        }
    }

    private onMouseMove(event: MouseEvent): void {
        event.preventDefault();

        if (this.panMousePosition) {
            this.onPan(event);
        } else if (this.rotateMousePosition && this.rotateAnchorPosition) {
            this.onRotate(event);
        }
    }

    private onPan(event: MouseEvent): void {
        const newMousePosition = new Three.Vector2(
            event.clientX,
            event.clientY
        );

        // Create a local NED system point in the direction of the camera (or cam
        // up direction if looking towards center of earth).
        const down = this.position.clone().normalize().negate();

        // Select which of the camera's forward or up axes that best
        // reprent forward for the sake of panning direction.
        var assumedForward = this.assumedCameraForwardAndUp();
        const right = new Three.Vector3().crossVectors(down, assumedForward);
        assumedForward = new Three.Vector3().crossVectors(right, down);

        const mouseVector = new Three.Vector2().subVectors(
            newMousePosition,
            this.panMousePosition!
        );

        const panLength = mouseVector.length();

        // Get the mouse move direction and apply it to the local NED system.
        const panDirection =
            Math.atan2(mouseVector.y, mouseVector.x) + Math.PI / 2.0;
        assumedForward.applyAxisAngle(down, panDirection);

        // Approximate a position in the direction of move and derive
        // a world rotation axis from it.
        const approxPosition = this.position
            .clone()
            .addScaledVector(assumedForward, 1000.0);
        const rotationAxis = new Three.Vector3()
            .crossVectors(approxPosition, this.position)
            .normalize();

        // Calculate the meters per pixel given the current ellipsoid height.
        const mpp = this.mppFromEllipsoidHeight();
        const cameraMoveDistance = panLength * mpp;

        // Rotate the camera to keep the relative view.
        const cameraRotationAngle = Math.atan2(
            cameraMoveDistance,
            this.position.length()
        );

        const rotationMatrix = new Three.Matrix4().makeRotationAxis(
            rotationAxis,
            cameraRotationAngle
        );
        this.position.applyMatrix4(rotationMatrix);
        this.orientation.premultiply(rotationMatrix);

        this.panMousePosition = newMousePosition;
        this.updateCamera();
    }

    private onRotate(event: MouseEvent): void {
        const newMousePosition = new Three.Vector2(
            event.clientX,
            event.clientY
        );

        const deltaX = newMousePosition.x - this.rotateMousePosition!.x;
        const deltaY = newMousePosition.y - this.rotateMousePosition!.y;

        // Get the vector between the anchor position and the camera's position.
        const anchorVector = new Three.Vector3().subVectors(
            this.position,
            this.rotateAnchorPosition!
        );

        this.tiltMouse(deltaY, anchorVector);
        this.rotateMouse(deltaX, anchorVector);

        this.rotateMousePosition = newMousePosition;
        this.updateCamera();
    }

    private tiltMouse(deltaY: number, anchorVector: Three.Vector3): void {
        const [_width, height] = this.size;

        // Calculate the tilt angle from the mouse move.
        const tiltAngle = -(deltaY / height) * degToRad(90.0);

        // Get the camera basis vectors.
        const [camX, camY, _camZ] = extractBasis(this.orientation);

        // Pick a tilt axis, depending on the angle between the camera
        // X axis and the anchor vector.
        const tiltAxis =
            camX.dot(anchorVector.clone().normalize()) > 0.0
                ? camX
                : camX.clone().negate();

        // Calculate the tilt axis length (anchorVector is the hypotenuse,
        // tilt axis will be near side).
        const tiltAxisLength =
            tiltAxis.dot(anchorVector.clone().normalize()) *
            anchorVector.length();

        // Create the pivot point along the axis.
        const tiltPivotPoint =
            this.rotateAnchorPosition!.clone().addScaledVector(
                tiltAxis,
                tiltAxisLength
            );

        // Rotate a vector between the pivot point and the camera.
        const tiltedPosition = tiltPivotPoint
            .clone()
            .add(
                new Three.Vector3()
                    .subVectors(this.position, tiltPivotPoint)
                    .applyAxisAngle(camX, tiltAngle)
            );

        // Calculate a camera rotation matrix (remember,
        // this is a GL camera == camX is side).
        const rotationMatrix = new Three.Matrix4().makeRotationAxis(
            camX,
            tiltAngle
        );

        // What would be the effective tilt if the tilt angle is applied?
        const [_newX, newY, _newZ] = extractBasis(
            this.orientation.clone().premultiply(rotationMatrix)
        );
        const effectiveTilt = radToDeg(
            Math.acos(
                newY.negate().dot(tiltedPosition.clone().normalize().negate())
            )
        );

        if (effectiveTilt >= 10.0 && effectiveTilt <= 90.0) {
            // Ok. Commit proposed change.
            this.position.set(
                tiltedPosition.x,
                tiltedPosition.y,
                tiltedPosition.z
            );
            this.orientation.premultiply(rotationMatrix);
        } else {
            console.log(
                `Effective tilt ${effectiveTilt} outside range. Tilt action is ignored`
            );
        }
    }

    private rotateMouse(deltaX: number, anchorVector: Three.Vector3): void {
        const [width, _height] = this.size;

        // Calculate the rotate angle from the mouse move.
        const rotateAngle = -(deltaX / width) * degToRad(360.0);

        // The anchor vector shall be rotate around the anchor up vector.
        const anchorUp = this.rotateAnchorPosition!.clone().normalize();
        const rotatedAnchorVector = anchorVector
            .clone()
            .applyAxisAngle(anchorUp, rotateAngle);

        // Create the rotated position.
        const rotatedPosition =
            this.rotateAnchorPosition!.clone().add(rotatedAnchorVector);

        this.position.set(
            rotatedPosition.x,
            rotatedPosition.y,
            rotatedPosition.z
        );

        // Create the camera rotation matrix.
        const rotationMatrix = new Three.Matrix4().makeRotationAxis(
            anchorUp,
            rotateAngle
        );
        this.orientation.premultiply(rotationMatrix);
    }

    private onMouseLeave(event: MouseEvent): void {
        event.preventDefault();

        this.panMousePosition = undefined;
        this.rotateMousePosition = undefined;
        this.rotateAnchorPosition = undefined;
    }

    private cameraForwardAndUp(): [Three.Vector3, Three.Vector3] {
        const [_camX, camY, camZ] = extractBasis(this.orientation);

        return [camZ.negate(), camY];
    }

    private assumedCameraForwardAndUp(): Three.Vector3 {
        const [forward, up] = this.cameraForwardAndUp();
        const down = this.position.clone().normalize().negate();

        const angle = radToDeg(Math.acos(forward.dot(down)));
        if (angle > 1.0 && angle < 179.0) {
            return forward;
        } else {
            return up;
        }
    }

    private mppFromEllipsoidHeight(): number {
        const [width, height] = this.size;
        const midPixel = new Three.Vector2(
            (width - 1.0) / 2.0,
            (height - 1.0) / 2.0
        );

        this.camera.updateMatrixWorld();
        this.camera.updateProjectionMatrix();

        const midRay = pxToWorldRay(this.camera, this.size, midPixel);
        const plusX = pxToWorldRay(
            this.camera,
            this.size,
            midPixel.clone().add(new Three.Vector2(1.0, 0.0))
        );
        const plusY = pxToWorldRay(
            this.camera,
            this.size,
            midPixel.clone().add(new Three.Vector2(0.0, 1.0))
        );

        const angleX = Math.acos(midRay.direction.dot(plusX.direction));
        const angleY = Math.acos(midRay.direction.dot(plusY.direction));

        const aboveEllipsoid = heightAboveEllipsoid(this.position);
        const meterX = aboveEllipsoid * Math.tan(angleX);
        const meterY = aboveEllipsoid * Math.tan(angleY);

        return Math.hypot(meterX, meterY);
    }

    // The current size of the rendering canvas.
    private size: Size;

    // The underlying perspective camera.
    private camera: Three.PerspectiveCamera;

    // A coordinate system converter.
    private converter: GeoConvert;

    // The navigator's ECEF position.
    private position: Three.Vector3;

    // Matrix carrying the orientation for the navigator.
    private orientation: Three.Matrix4;

    // Mouse positions for panning and rotation.
    private panMousePosition?: Three.Vector2;
    private rotateMousePosition?: Three.Vector2;

    // Ellipsoid anchor for rotation.
    private rotateAnchorPosition?: Three.Vector3;
}
