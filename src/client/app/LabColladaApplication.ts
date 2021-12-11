import * as Three from 'three';

import { Application } from './Application';
import { Collada } from 'three/examples/jsm/loaders/ColladaLoader';
import { fetchCollada, modifyTerrainColladaModel } from '../data/ColladaLoad';
import { GeoConvertUtm } from '../math/GeoConvert';
import { ColladaReceiver } from './ColladaReceiver';
import { Size } from '../types/Size';
import { SceneRenderer } from '../render/SceneRenderer';
import { OrbitingWorldNavigator } from '../render/OrbitingWorldNavigator';
import { SemiMajorAxis } from '../math/Ellipsoid';

export class LabColladaApplication implements Application, ColladaReceiver {
    public constructor(size: Size) {
        this.geoConvertUtm = new GeoConvertUtm(10);
        this.scene = new Three.Scene();

        this.renderer = new SceneRenderer();
        const [width, height] = size;
        this.renderer.setSize(width, height);

        document.body.appendChild(this.renderer.domElement);

        this.navigator = new OrbitingWorldNavigator(
            50,
            1.0,
            SemiMajorAxis,
            this.renderer.domElement
        );

        fetchCollada(1, 'collada/10/523/10_523_593/10_523_593.dae', this);
    }

    public render(): void {
        this.navigator.updateCamera();
        this.renderer.render(this.scene, this.navigator.getCamera());
    }

    public resize(size: Size): void {
        this.navigator.setSize(size);
        this.renderer.setDrawingArea(this.navigator.getDrawingArea());

        console.log(this.navigator.getCamera().position);
    }

    public receiveColladaSucceeded(
        model: Collada,
        id: number,
        url: string
    ): void {
        const [result, bbox] = modifyTerrainColladaModel(
            this.geoConvertUtm,
            model
        );
        if (result) {
            const center = bbox.getCenter(new Three.Vector3());
            console.log('center: ', center);

            const normal = center.clone().normalize();
            const camPos = center.clone().addScaledVector(normal, 1000.0);
            this.navigator.tiltedAt(camPos);

            this.scene.add(model.scene);
            this.scene.add(new Three.Box3Helper(bbox));

            console.log('added');
        }
    }

    public receiveColladaFailed(id: number, url: string): void {
        console.warn(`failed to load collada ${url}`);
    }

    private geoConvertUtm: GeoConvertUtm;
    private scene: Three.Scene;
    private renderer: SceneRenderer;
    private navigator: OrbitingWorldNavigator;
}
