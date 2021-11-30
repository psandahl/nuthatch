import * as Three from 'three';

import { DrawingArea, fullDrawingArea } from '../types/DrawingArea';
import { pxToUv, pxToWorldRay } from '../math/CameraTransforms';
import {
    heightAboveEllipsoid,
    intersectEllipsoid,
    SemiMajorAxis,
} from '../math/Ellipsoid';
import { Size } from '../types/Size';
import { WorldNavigator } from './WorldNavigator';

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

        this.position = new Three.Vector3();
        this.orientation = new Three.Matrix4();
        this.lookAt(
            new Three.Vector3(SemiMajorAxis * 3, 0.0, 0.0),
            new Three.Vector3(0, 0, 0),
            new Three.Vector3(0, 0, 1)
        );
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

    private onWheel(event: WheelEvent): void {
        event.preventDefault();

        // Fake at the moment.
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
                console.log(
                    `Rotate anchor at x: ${this.rotateAnchorPosition.x}, y: ${this.rotateAnchorPosition.y}, z: ${this.rotateAnchorPosition.z}`
                );
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
            const newMousePosition = new Three.Vector2(
                event.clientX,
                event.clientY
            );

            // Create a local NED system point in the direction of the camera (or cam
            // up direction if looking towards center of earth).
            const down = this.position.clone().normalize().negate();
            const [camForward, camUp] = this.cameraForwardAndUp();
            const dForward = Math.abs(down.dot(camForward));
            const dUp = Math.abs(down.dot(camUp));

            // Select which of the camera's forward or up axes that best
            // reprent forward for the sake of panning direction.
            var forward = dForward < dUp ? camForward : camUp;
            const right = new Three.Vector3().crossVectors(down, forward);
            forward = new Three.Vector3().crossVectors(right, down);

            const mouseVector = new Three.Vector2().subVectors(
                newMousePosition,
                this.panMousePosition
            );

            const panLength = mouseVector.length();

            // Get the mouse move direction and apply it to the local NED system.
            const panDirection =
                Math.atan2(mouseVector.y, mouseVector.x) + Math.PI / 2.0;
            forward.applyAxisAngle(down, panDirection);

            // Approximate a position in the direction of move and derive
            // a world rotation axis from it.
            const approxPosition = this.position
                .clone()
                .addScaledVector(forward, 1000.0);
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

            // Remember the new mouse position.
            this.panMousePosition = newMousePosition;

            this.camera.updateMatrixWorld();
        }
    }

    private onMouseLeave(event: MouseEvent): void {
        event.preventDefault();

        this.panMousePosition = undefined;
        this.rotateMousePosition = undefined;
        this.rotateAnchorPosition = undefined;
    }

    private cameraForwardAndUp(): [Three.Vector3, Three.Vector3] {
        const camX = new Three.Vector3();
        const camY = new Three.Vector3();
        const camZ = new Three.Vector3();
        this.camera.matrixWorld.extractBasis(camX, camY, camZ);

        return [camZ.negate(), camY];
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
