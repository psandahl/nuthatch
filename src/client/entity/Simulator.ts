import * as Three from 'three';

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
            const trackPoint = point.clone().addScaledVector(direction, 50);
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

    public update(_secondsSinceStart: number, _millisSinceLast: number): void {}

    private scene: Three.Scene;

    private markerGroupActive = false;
    private markerGroup: Three.Group;
    private trackPoints: Three.Vector3[] = [];

    private sphereGeometry: Three.SphereGeometry;
    private sphereMaterial: Three.MeshBasicMaterial;
    private lineMaterial: Three.LineBasicMaterial;
}
