import * as Three from 'three';

import { Application } from './Application';
import { GeoConvertWgs84 } from '../math/GeoConvert';
import { matrixLocalNed4 } from '../math/Matrix';
import { makeGlobe } from '../render/Globe';
import { OrbitingWorldNavigator } from '../render/OrbitingWorldNavigator';
import { SceneRenderer } from '../render/SceneRenderer';
import { SemiMajorAxis, InverseFlattening } from '../math/Ellipsoid';
import { Size } from '../types/Size';

export class LabNavApplication implements Application {
    constructor(size: Size) {
        this.scene = new Three.Scene();

        this.renderer = new SceneRenderer();
        const [width, height] = size;
        this.renderer.setSize(width, height);
        document.body.appendChild(this.renderer.domElement);

        this.navigator = new OrbitingWorldNavigator(
            50,
            1.0,
            SemiMajorAxis * 4.0,
            this.renderer.domElement
        );

        this.converter = new GeoConvertWgs84();
        this.localAxes = new Three.AxesHelper(1.0);
        this.updateLocalAxes();
        this.scene.add(this.localAxes);

        this.scene.add(makeGlobe());
    }

    public render(): void {
        this.navigator.updateCamera();
        this.updateLocalAxes();

        this.renderer.render(this.scene, this.navigator.getCamera());
    }

    public resize(size: Size): void {
        this.navigator.setSize(size);
        this.renderer.setDrawingArea(this.navigator.getDrawingArea());
    }

    private pointAlongCameraAxis(): Three.Vector3 {
        const direction = new Three.Vector3();
        this.navigator.getCamera().getWorldDirection(direction);

        return this.navigator
            .getCamera()
            .position.clone()
            .addScaledVector(direction, 5.0);
    }

    private updateLocalAxes(): void {
        const axesPosition = this.pointAlongCameraAxis();
        this.localAxes.position.set(
            axesPosition.x,
            axesPosition.y,
            axesPosition.z
        );

        this.localAxes.setRotationFromMatrix(
            matrixLocalNed4(axesPosition, this.converter)
        );
        this.localAxes.updateMatrixWorld();
    }

    private scene: Three.Scene;
    private renderer: SceneRenderer;
    private navigator: OrbitingWorldNavigator;
    private converter: GeoConvertWgs84;
    private localAxes: Three.AxesHelper;
}
