import * as Three from 'three';

import { Application } from './Application';
import { GeoConvert } from '../math/GeoConvert';
import { matrixLocalNed4 } from '../math/Matrix';
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

        this.converter = new GeoConvert();
        this.localAxes = new Three.AxesHelper(1.0);
        this.updateLocalAxes();
        this.scene.add(this.localAxes);

        const textureLoader = new Three.TextureLoader();
        const earth = textureLoader.load('/images/earth_texture.png');
        const sphereGeometry = new Three.SphereGeometry(SemiMajorAxis, 32, 32);
        const sphereMaterial = new Three.MeshBasicMaterial({ map: earth });
        const sphere = new Three.Mesh(sphereGeometry, sphereMaterial);
        sphere.scale.set(1, 1.0 - 1.0 / InverseFlattening, 1.0);
        sphere.rotateX(Math.PI / 2);
        this.scene.add(sphere);
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
    private converter: GeoConvert;
    private localAxes: Three.AxesHelper;
}
