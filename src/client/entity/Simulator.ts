import * as Three from 'three';
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';

import { fetchGLTF } from '../data/GLTFLoad';
import { GLTFReceiver } from '../types/GLTFReceiver';

/**
 * Simulation instance.
 */
class Simulation {
    public constructor(points: Three.Vector3[], model: GLTF, velocity: number) {
        this.group = new Three.Group();
        this.group.renderOrder = 1;

        this.curve = new Three.CatmullRomCurve3(points, true);

        this.mesh = model.scene.children[0].clone() as Three.Mesh;
        this.mesh.visible = false;
        this.mesh.scale.set(0.2, 0.2, 0.2);

        this.mixer = new Three.AnimationMixer(this.mesh);
        this.mixer.clipAction(model.animations[0]).setDuration(1).play();

        const trackGeometry = new Three.BufferGeometry().setFromPoints(
            this.curve.getPoints(100)
        );

        this.track = new Three.Line(
            trackGeometry,
            new Three.LineBasicMaterial({ color: 0xffff00 })
        );

        this.group.add(this.mesh);
        this.group.add(this.track);

        const distance = this.curve.getLength();
        this.lapTime = Math.round((distance / velocity) * 1000.0);

        this.setPosition(0);
    }

    /**
     * Get the simulation's group.
     * @returns The group
     */
    public getGroup(): Three.Group {
        return this.group;
    }

    /**
     * Update the simulation.
     * @param deltaMillis The delta time since last update
     */
    public update(deltaMillis: number): void {
        this.time += deltaMillis;
        if (this.running) {
            const lap = this.time % this.lapTime;

            const t = lap / this.lapTime;
            this.setPosition(t);

            this.mixer.update(deltaMillis / 1000.0);
        } else {
            if (this.time > 1000) {
                this.group.remove(this.track);

                this.mesh.visible = true;
                this.running = true;
            }
        }
    }

    private setPosition(t: number): void {
        const position = this.curve.getPoint(t);
        const direction = this.curve.getTangent(t);
        this.mesh.up.copy(position.clone().normalize());
        this.mesh.position.copy(this.curve.getPoint(t));
        this.mesh.lookAt(position.clone().addScaledVector(direction, 1));
    }

    private group: Three.Group;
    private curve: Three.CatmullRomCurve3;
    private mesh: Three.Mesh;
    private mixer: Three.AnimationMixer;
    private track: Three.Line;
    private lapTime: number;
    private time = 0;
    private running = false;
}

/**
 * A simple Catmull Rom simulator driving entities round a track.
 */
export class Simulator implements GLTFReceiver {
    /**
     * Create the simulator.
     */
    public constructor() {
        this.scene = new Three.Scene();

        // Very simple lightning.
        this.hemiLight = new Three.HemisphereLight(0xffffff, 0xffffff, 1.0);
        this.hemiLight.color.setHSL(0.6, 1, 0.6);
        this.hemiLight.groundColor.setHSL(0.095, 1, 0.75);
        this.scene.add(this.hemiLight);

        this.markerGroup = new Three.Group();
        this.markerGroup.renderOrder = 1;

        this.sphereGeometry = new Three.SphereGeometry(5);
        this.sphereMaterial = new Three.MeshBasicMaterial({ color: 0xff0000 });
        this.lineMaterial = new Three.LineBasicMaterial({ color: 0xff0000 });

        fetchGLTF(1, 'models/Flamingo.glb', this);
    }

    public receiveGLTFSucceeded(model: GLTF, id: number, url: string): void {
        this.simulatedModel = model;
    }

    public receiveGLTFFailed(id: number, url: string): void {
        console.error(`Failed to receive GLTF model from ${url}`);
    }

    /**
     * Activate the track editor for adding a new simulation track.
     */
    public createTrack(): void {
        this.markerGroupActive = true;
        this.scene.add(this.markerGroup);
    }

    /**
     * Finalize the simulation track and close the editor.
     */
    public finalizeTrack(): void {
        if (this.trackPoints.length >= 2) {
            if (this.simulatedModel) {
                const simulation = new Simulation(
                    this.trackPoints,
                    this.simulatedModel,
                    20
                );
                this.simulations.push(simulation);
                this.scene.add(simulation.getGroup());
            } else {
                console.error('Failed to add model to simulation');
            }
        }

        this.scene.remove(this.markerGroup);
        this.markerGroup.clear();
        this.trackPoints = [];

        this.markerGroupActive = false;
    }

    /**
     * Check if there's a track editor open.
     * @returns True if there's active track editor.
     */
    public hasOpenTrack(): boolean {
        return this.markerGroupActive;
    }

    /**
     * Add a new point to the track editor.
     * @param point An ECEF track point (where mouse intersects terrain)
     */
    public addTrackPoint(point: Three.Vector3): void {
        if (this.hasOpenTrack()) {
            // Assume geocentric coordinate, where direction is same as point.
            const direction = point.clone().normalize();

            // Ad hoc. Add 20 meters above the selected point.
            const trackPoint = point.clone().addScaledVector(direction, 20);
            this.trackPoints.push(trackPoint);

            const sphere = new Three.Mesh(
                this.sphereGeometry,
                this.sphereMaterial
            );
            sphere.position.copy(trackPoint);
            this.markerGroup.add(sphere);

            const lineGeometry = new Three.BufferGeometry().setFromPoints([
                point,
                trackPoint,
            ]);
            const line = new Three.Line(lineGeometry, this.lineMaterial);

            this.markerGroup.add(line);
        }
    }

    /**
     * Get the scene for the simulation.
     * @returns The scene
     */
    public getScene(): Three.Scene {
        return this.scene;
    }

    /**
     * Update the simulation.
     * @param deltaMillis The delta time since last update
     */
    public update(deltaMillis: number): void {
        this.simulations.forEach((simulation, _index, _array) => {
            simulation.update(deltaMillis);
        });
    }

    private scene: Three.Scene;
    private hemiLight: Three.HemisphereLight;

    private markerGroupActive = false;
    private markerGroup: Three.Group;
    private trackPoints: Three.Vector3[] = [];

    private sphereGeometry: Three.SphereGeometry;
    private sphereMaterial: Three.MeshBasicMaterial;
    private lineMaterial: Three.LineBasicMaterial;

    private simulatedModel?: GLTF;
    private simulations: Simulation[] = [];
}
