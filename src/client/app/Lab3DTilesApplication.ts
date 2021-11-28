import * as Three from 'three';

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { TilesRenderer } from '3d-tiles-renderer';

import { Application } from './Application';
import { fullDrawingArea } from '../render/DrawingArea';
import { SceneCamera } from '../render/SceneCamera';
import { SceneRenderer } from '../render/SceneRenderer';
import { Size } from '../types/Size';

export class Lab3DTilesApplication implements Application {
    public constructor(size: Size) {
        this.size = size;
        const [width, height] = size;

        this.scene = new Three.Scene();
        this.renderer = new SceneRenderer();
        this.camera = new SceneCamera();
        this.camera.resize(width, height);
        this.camera.position.z = 5;

        /*const geo = new Three.BoxGeometry(1, 1, 1);
        const mat = new Three.MeshBasicMaterial({
            color: 0xffff00,
            wireframe: true,
        });
        const mesh = new Three.Mesh(geo, mat);
        mesh.position.set(1, 2, 1);
        this.scene.add(mesh);

        console.log(mesh.getWorldPosition(new Three.Vector3()));
        */

        this.tilesRenderer = new TilesRenderer(
            '3d-tiles/1.0/TilesetWithDiscreteLOD/tileset.json'
        );

        this.tilesRenderer.setCamera(this.camera);
        this.tilesRenderer.setResolutionFromRenderer(
            this.camera,
            this.renderer
        );
        this.scene.add(this.tilesRenderer.group);

        this.tilesRenderer.onLoadTileSet = (tileSet: Object) => {
            const tilesBox = new Three.Box3();
            if (this.tilesRenderer.getBounds(tilesBox)) {
                const center = new Three.Vector3();
                tilesBox.getCenter(center);
                console.log('center: ', center);

                const normal = center.clone().normalize();
                const camPos = center.clone().addScaledVector(normal, 2000);
                console.log('cam pos: ', camPos);
                this.camera.position.set(camPos.x, camPos.y, camPos.z);

                const light = new Three.SpotLight(0xffffff, 0.4);
                light.position.set(camPos.x, camPos.y, camPos.z);
                this.scene.add(light);

                this.camera.up = normal;
                this.camera.lookAt(center);
            }
        };

        this.navigator = new OrbitControls(
            this.camera,
            this.renderer.domElement
        );

        this.navigator.maxZoom = 2.0;
    }

    public render(): void {
        this.navigator.update();
        this.camera.updateMatrixWorld();

        this.tilesRenderer.update();

        this.renderer.render(this.scene, this.camera);
    }

    public resize(size: Size): void {
        const [width, height] = size;
        this.camera.resize(width, height);
        this.renderer.setDrawingArea(fullDrawingArea(width, height));
    }

    private size: Size;
    private scene: Three.Scene;
    private renderer: SceneRenderer;
    private camera: SceneCamera;
    private navigator: OrbitControls;
    private tilesRenderer: TilesRenderer;
}
