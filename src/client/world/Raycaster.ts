import * as Three from 'three';

export class Raycaster {
    constructor(scene: Three.Scene) {
        this.scene = scene;
        this.rayCaster = new Three.Raycaster();

        this.rayCaster.params.Mesh = { threshold: 1 };
        console.log(this.rayCaster.params);
    }

    public intersect(ray: Three.Ray | undefined): void {
        if (ray) {
            this.rayCaster.ray.copy(ray);
            const intersections = this.rayCaster.intersectObjects(
                this.scene.children
            );
            if (intersections.length > 0) {
                const intersection = intersections[0];
                console.log(intersection);
            } else {
                console.log('no intersection');
            }
        } else {
            console.log('no ray');
        }
    }

    private scene: Three.Scene;
    private rayCaster: Three.Raycaster;
}
