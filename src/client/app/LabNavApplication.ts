import * as Three from 'three';

import { Application } from './Application';
import { GeoConvert } from '../math/GeoConvert';
import { matrixLocalNed4 } from '../math/Matrix';
import { ExploringWorldNavigator } from '../render/ExploringWorldNavigator';
import { SceneRenderer } from '../render/SceneRenderer';

export class LabNavApplication implements Application {
    constructor(width: number, height: number) {
        this.scene = new Three.Scene();

        this.renderer = new SceneRenderer();
        this.renderer.setSize(width, height);
        document.body.appendChild(this.renderer.domElement);

        this.navigator = new ExploringWorldNavigator(
            50,
            0.1,
            1000.0,
            this.renderer.domElement
        );

        const axes = new Three.AxesHelper(1.0);
        this.scene.add(axes);

        const converter = new GeoConvert();
        const geoC = converter.wgs84ToEcef(new Three.Vector3(0, 0, 0));
        console.log(geoC);

        const mat = matrixLocalNed4(geoC, converter);
        const ned = new Three.AxesHelper(1.0);
        ned.setRotationFromMatrix(mat);
        //this.scene.add(ned);
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
    private navigator: ExploringWorldNavigator;
}
