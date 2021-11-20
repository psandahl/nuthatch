import * as Three from 'three';

import { Application } from './Application';
import { GeoConvert } from '../math/GeoConvert';
import { matrixLocalNed4 } from '../math/Matrix';
import { MouseTerrainNavigator } from '../render/MouseTerrainNavigator';
import { SceneRenderer } from '../render/SceneRenderer';

export class LabNavApplication implements Application {
    constructor(width: number, height: number) {
        this.scene = new Three.Scene();

        this.renderer = new SceneRenderer();
        this.renderer.setSize(width, height);
        document.body.appendChild(this.renderer.domElement);

        this.navigator = new MouseTerrainNavigator(
            50,
            0.1,
            1000.0,
            this.renderer.domElement
        );
        this.navigator.setPose(new Three.Vector3(5, 0, 1), new Three.Vector3());

        const axes = new Three.AxesHelper(1.0);
        //this.scene.add(axes);

        const converter = new GeoConvert();
        const mat = matrixLocalNed4(
            new Three.Vector3(-2206719.103843, -4878960.298373, 3459402.703715),
            converter
        );
        const ned = new Three.AxesHelper(1.0);
        ned.setRotationFromMatrix(mat);
        this.scene.add(ned);
    }

    public render(): void {
        this.navigator.updateCamera();
        this.renderer.render(this.scene, this.navigator.getCamera());
    }

    public resize(width: number, height: number): void {
        this.navigator.setSize(width, height);
        this.renderer.setDrawingArea(this.navigator.getDrawingArea());
    }

    private scene: Three.Scene;
    private renderer: SceneRenderer;
    private navigator: MouseTerrainNavigator;
}
