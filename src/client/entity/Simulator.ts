import * as Three from 'three';

class Simulation {
    public constructor(
        points: Three.Vector3[],
        mesh: Three.Mesh,
        velocity: number
    ) {
        this.curve = new Three.CatmullRomCurve3(points, true);
        this.mesh = mesh;
        this.mesh.position.copy(this.curve.getPoint(0));

        const distance = this.curve.getLength();
        this.lapTime = Math.round((distance / velocity) * 1000.0);
    }

    public approximation(): Three.Vector3[] {
        return this.curve.getPoints(100);
    }

    public update(time: number): void {
        this.time += time;

        const lap = this.time % this.lapTime;
        this.mesh.position.copy(this.curve.getPoint(lap / this.lapTime));
    }

    private curve: Three.CatmullRomCurve3;
    private mesh: Three.Mesh;
    private lapTime: number;
    private time = 0;
}

export class Simulator {
    public constructor() {
        this.scene = new Three.Scene();

        this.markerGroup = new Three.Group();
        this.markerGroup.renderOrder = 1;

        this.sphereGeometry = new Three.SphereGeometry(5);
        this.sphereMaterial = new Three.MeshBasicMaterial({ color: 0xff0000 });
        this.lineMaterial = new Three.LineBasicMaterial({ color: 0xff0000 });
    }

    public createTrack(): void {
        this.markerGroupActive = true;
        this.scene.add(this.markerGroup);
    }

    public finalizeTrack(): void {
        if (this.trackPoints.length >= 2) {
            const color = new Three.Color(
                Math.random(),
                Math.random(),
                Math.random()
            );

            const sphere = new Three.Mesh(
                this.sphereGeometry,
                new Three.MeshBasicMaterial({ color: color.getHex() })
            );

            const simulation = new Simulation(this.trackPoints, sphere, 20);
            this.simulations.push(simulation);

            const curveGeometry = new Three.BufferGeometry().setFromPoints(
                simulation.approximation()
            );
            const curve = new Three.Line(
                curveGeometry,
                new Three.LineBasicMaterial({ color: 0xffff00 })
            );

            const group = new Three.Group();
            group.renderOrder = 1;
            group.add(sphere);
            group.add(curve);

            this.scene.add(group);
        }

        this.scene.remove(this.markerGroup);
        this.markerGroup.clear();
        this.trackPoints = [];

        this.markerGroupActive = false;
    }

    public hasOpenTrack(): boolean {
        return this.markerGroupActive;
    }

    public addTrackPoint(point: Three.Vector3): void {
        if (this.hasOpenTrack()) {
            // Assume geocentric coordinate, where direction is same as point.
            const direction = point.clone().normalize();

            // Ad hoc. Add 50 meters above the selected point.
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

    public getScene(): Three.Scene {
        return this.scene;
    }

    public update(_secondsSinceStart: number, millisSinceLast: number): void {
        this.simulations.forEach((simulation, _index, _array) => {
            simulation.update(millisSinceLast);
        });
    }

    private scene: Three.Scene;

    private markerGroupActive = false;
    private markerGroup: Three.Group;
    private trackPoints: Three.Vector3[] = [];

    private simulations: Simulation[] = [];

    private sphereGeometry: Three.SphereGeometry;
    private sphereMaterial: Three.MeshBasicMaterial;
    private lineMaterial: Three.LineBasicMaterial;
}
