import * as Three from 'three';

import { SemiMajorAxis, InverseFlattening } from '../math/Ellipsoid';

/**
 * Helper function to create a simple textured globe.
 * @returns A globe mesh.
 */
export function makeGlobe(): Three.Mesh {
    const textureLoader = new Three.TextureLoader();
    const earth = textureLoader.load('/images/earth_texture.png');
    const sphereGeometry = new Three.SphereGeometry(SemiMajorAxis, 32, 32);
    const sphereMaterial = new Three.MeshBasicMaterial({ map: earth });
    const sphere = new Three.Mesh(sphereGeometry, sphereMaterial);
    sphere.scale.set(1, 1.0 - 1.0 / InverseFlattening, 1.0);
    sphere.rotateX(Math.PI / 2);

    return sphere;
}
