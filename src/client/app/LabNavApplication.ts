import * as Three from 'three';

import * as Mat from '../math/Matrix';

import { Application } from './Application';
import { MouseTerrainNavigator } from '../render/MouseTerrainNavigator';

export class LabNavApplication implements Application {
    constructor(width: number, height: number) {
        this.scene = new Three.Scene();

        this.renderer = new Three.WebGLRenderer();
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

        this.scene.add(axes);
    }

    public render(): void {
        this.navigator.updateCamera();
        this.renderer.render(this.scene, this.navigator.getCamera());
    }

    public resize(width: number, height: number): void {
        this.navigator.setSize(width, height);
        this.renderer.setSize(width, height);
    }

    private scene: Three.Scene;
    private renderer: Three.WebGLRenderer;
    private navigator: MouseTerrainNavigator;
}
