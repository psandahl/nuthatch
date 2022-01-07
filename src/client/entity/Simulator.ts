import * as Three from 'three';

class Simulation {
    public constructor(
        points: Three.Vector3[],
        mesh: Three.Mesh,
        velocity: number
    ) {
        this.group = new Three.Group();
        this.group.renderOrder = 1;

        this.curve = new Three.CatmullRomCurve3(points, true);
        this.mesh = mesh;
        this.mesh.visible = false;
        this.mesh.position.copy(this.curve.getPoint(0));

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
    }

    public getGroup(): Three.Group {
        return this.group;
    }

    public update(deltaMillis: number): void {
        this.time += deltaMillis;
        if (this.running) {
            const lap = this.time % this.lapTime;
            this.mesh.position.copy(this.curve.getPoint(lap / this.lapTime));
        } else {
            if (this.time > 1000) {
                this.group.remove(this.track);

                this.mesh.visible = true;
                this.running = true;
            }
        }
    }

    private group: Three.Group;
    private curve: Three.CatmullRomCurve3;
    private mesh: Three.Mesh;
    private track: Three.Line;
    private lapTime: number;
    private time = 0;
    private running = false;
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
            // Todo: Make some more interesting mesh ...
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

            this.scene.add(simulation.getGroup());
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

    public update(deltaMillis: number): void {
        this.simulations.forEach((simulation, _index, _array) => {
            simulation.update(deltaMillis);
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
