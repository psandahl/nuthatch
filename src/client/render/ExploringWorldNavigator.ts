import * as Three from 'three';

import { DrawingArea, fullDrawingArea } from './DrawingArea';
import { degToRad, earthRadius, radToDeg } from '../math/Helpers';
import { matrixNedToGl4, matrixLookAtNed4 } from '../math/Matrix';
import { Size } from '../types/Size';
import { WorldNavigator } from './WorldNavigator';

export class ExploringWorldNavigator implements WorldNavigator {
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
        this.width = canvas.width;
        this.height = canvas.height;
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
            new Three.Vector3(earthRadius() * 5, 0.0, 0.0),
            new Three.Vector3(0, 0, 0),
            new Three.Vector3(0, 0, 1)
        );
        this.updateCamera();

        this.panMousePosition = undefined;

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
        const [width, height] = size;
        this.width = width;
        this.height = height;
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
    }

    public getDrawingArea(): DrawingArea {
        return fullDrawingArea(this.width, this.height);
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
        const heightAboveEllipsoid = this.position.length() - earthRadius();
        const stride = Math.max(1.0, heightAboveEllipsoid / 10.0);
        const direction = event.deltaY < 0 ? 1.0 : -1.0;
        this.position.addScaledVector(
            this.camera.getWorldDirection(new Three.Vector3()),
            direction * stride
        );
    }

    private onMouseDown(event: MouseEvent): void {
        event.preventDefault();

        console.log(`Press mouse button: ${event.button}`);
        if (event.button === 0) {
            this.panMousePosition = new Three.Vector2(
                event.clientX,
                event.clientY
            );
        }

        console.log(event);
    }

    private onMouseUp(event: MouseEvent): void {
        event.preventDefault();

        console.log(`Release mouse button: ${event.button}`);
        if (event.button === 0) {
            this.panMousePosition = undefined;
        }
    }

    private onMouseMove(event: MouseEvent): void {
        event.preventDefault();

        if (this.panMousePosition) {
            console.log('Mouse pan');
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

            // TODO.
            var forward = dForward < dUp ? camForward : camUp;
            const right = new Three.Vector3().crossVectors(down, forward);
            forward = new Three.Vector3().crossVectors(right, down);

            const mouseVector = new Three.Vector2().subVectors(
                newMousePosition,
                this.panMousePosition
            );

            const mouseAngle =
                Math.atan2(mouseVector.y, mouseVector.x) + Math.PI / 2.0;
            forward.applyAxisAngle(down, mouseAngle);

            const approxPosition = this.position
                .clone()
                .addScaledVector(forward, 1000.0);
            const rotationAxis = new Three.Vector3()
                .crossVectors(approxPosition, this.position)
                .normalize();

            const rotationMatrix = new Three.Matrix4().makeRotationAxis(
                rotationAxis,
                degToRad(0.5)
            );
            this.position.applyMatrix4(rotationMatrix);
            this.orientation.premultiply(rotationMatrix);

            this.panMousePosition = newMousePosition;

            this.camera.updateMatrixWorld();
        }
    }

    private onMouseLeave(event: MouseEvent): void {
        event.preventDefault();

        console.log('Mouse leave canvas');
        this.panMousePosition = undefined;
    }

    private cameraForwardAndUp(): [Three.Vector3, Three.Vector3] {
        const camX = new Three.Vector3();
        const camY = new Three.Vector3();
        const camZ = new Three.Vector3();
        this.camera.matrixWorld.extractBasis(camX, camY, camZ);

        return [camZ.negate(), camY];
    }

    // The current width of the rendering canvas.
    private width: number;

    // The current height of the rendering canvas.
    private height: number;

    // The underlying perspective camera.
    private camera: Three.PerspectiveCamera;

    // The navigators ECEF position.
    private position: Three.Vector3;

    // Matrix carrying the orientation for the navigator.
    private orientation: Three.Matrix4;

    private panMousePosition?: Three.Vector2;
}
