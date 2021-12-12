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

        this.scene.add(new Three.AmbientLight(0x404040, 2.0));

        fetchCollada(1, 'collada/10/523/10_523_593/10_523_593.dae', this);
        fetchCollada(2, 'collada/10/523/10_523_594/10_523_594.dae', this);
        fetchCollada(3, 'collada/10/523/10_523_595/10_523_595.dae', this);

        fetchCollada(4, 'collada/10/524/10_524_593/10_524_593.dae', this);
        fetchCollada(5, 'collada/10/524/10_524_594/10_524_594.dae', this);
        fetchCollada(6, 'collada/10/524/10_524_595/10_524_595.dae', this);

        fetchCollada(7, 'collada/10/525/10_525_593/10_525_593.dae', this);
        fetchCollada(8, 'collada/10/525/10_525_594/10_525_594.dae', this);
        fetchCollada(9, 'collada/10/525/10_525_595/10_525_595.dae', this);
    }

    public render(): void {
        this.navigator.updateCamera();
        this.renderer.render(this.scene, this.navigator.getCamera());
    }

    public resize(size: Size): void {
        this.navigator.setSize(size);
        this.renderer.setDrawingArea(this.navigator.getDrawingArea());
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

            const normal = center.clone().normalize();
            const camPos = center.clone().addScaledVector(normal, 3000.0);
            this.navigator.tiltedAt(camPos);

            this.scene.add(model.scene);
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
