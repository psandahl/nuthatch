import * as Three from 'three';

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { TilesRenderer } from '3d-tiles-renderer';

import { Application } from './Application';
import { fullDrawingArea } from '../types/DrawingArea';
import { SceneCamera } from '../render/SceneCamera';
import { SceneRenderer } from '../render/SceneRenderer';
import { Size } from '../types/Size';
import { OrbitingWorldNavigator } from '../render/OrbitingWorldNavigator';
import { SemiMajorAxis } from '../math/Ellipsoid';

export class Lab3DTilesApplication implements Application {
    public constructor(size: Size) {
        const [width, height] = size;

        this.scene = new Three.Scene();

        this.renderer = new SceneRenderer();
        this.renderer.setSize(width, height);

        document.body.appendChild(this.renderer.domElement);

        this.navigator = new OrbitingWorldNavigator(
            50,
            1.0,
            SemiMajorAxis * 4.0,
            this.renderer.domElement
        );

        this.tilesRenderer = new TilesRenderer(
            '3d-tiles/1.0/TilesetWithDiscreteLOD/tileset.json'
        );

        this.tilesRenderer.setCamera(this.navigator.getCamera());
        this.tilesRenderer.setResolutionFromRenderer(
            this.navigator.getCamera(),
            this.renderer
        );
        this.scene.add(this.tilesRenderer.group);

        this.light = new Three.AmbientLight(0x404040);
        this.scene.add(this.light);

        this.tilesRenderer.onLoadTileSet = (tileSet: Object) => {
            const tilesBox = new Three.Box3();
            if (this.tilesRenderer.getBounds(tilesBox)) {
                const center = new Three.Vector3();
                tilesBox.getCenter(center);

                console.log('center: ', center);

                const normal = center.clone().normalize();
                /*const camPos = center
                    .clone()
                    .addScaledVector(normal, 2000)
                    .applyAxisAngle(new Three.Vector3(1, 0, 0), Math.PI / 4);
                console.log('cam pos: ', camPos);
                */

                const camPos = center
                    .clone()
                    .add(new Three.Vector3(1000, 0, 0));

                this.navigator.lookAt(
                    camPos,
                    center,
                    new Three.Vector3(0, 0, 1)
                );
            }
        };
    }

    public render(): void {
        this.navigator.updateCamera();
        this.tilesRenderer.update();

        this.renderer.render(this.scene, this.navigator.getCamera());
    }

    public resize(size: Size): void {
        this.navigator.setSize(size);
        this.renderer.setDrawingArea(this.navigator.getDrawingArea());
    }

    private scene: Three.Scene;
    private renderer: SceneRenderer;
    private navigator: OrbitingWorldNavigator;
    private tilesRenderer: TilesRenderer;
    private light: Three.AmbientLight;
}
