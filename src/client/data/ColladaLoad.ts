import * as Three from 'three';
import {
    Collada,
    ColladaLoader,
} from 'three/examples/jsm/loaders/ColladaLoader';

import { ColladaReceiver } from '../app/ColladaReceiver';
import { GeoConvertUtm } from '../math/GeoConvert';

export function fetchCollada(
    id: number,
    url: string,
    receiver: ColladaReceiver
): void {
    const loader = new ColladaLoader();
    loader.load(
        url,
        (model) => {
            receiver.receiveColladaSucceeded(model, id, url);
        },
        (progress) => console.log(`${url} has loaded ${progress.loaded} bytes`),
        (_error) => receiver.receiveColladaFailed(id, url)
    );
}

export function modifyTerrainColladaModel(
    convert: GeoConvertUtm,
    model: Collada
): [boolean, Three.Box3] {
    var result = true;

    var bbox = new Three.Box3();
    model.scene.traverse((child) => {
        if (child instanceof Three.Mesh) {
            const mesh = child as Three.Mesh;
            if (
                mesh.geometry.hasAttribute('position') &&
                mesh.geometry.getAttribute('position').itemSize === 3 &&
                !mesh.geometry.index
            ) {
                mesh.updateMatrixWorld();

                // Rewrite all positions to ECEF.
                const position = mesh.geometry.getAttribute('position');
                for (let i = 0; i < position.count; ++i) {
                    const e = position.getX(i);
                    const n = position.getY(i);
                    const h = position.getZ(i);

                    const utm = mesh.localToWorld(new Three.Vector3(e, n, h));
                    const ecef = convert.utmToEcef(utm);

                    position.setXYZ(i, ecef.x, ecef.y, ecef.z);
                }

                // The world matrix must be reset to identity.
                mesh.matrixWorld = new Three.Matrix4();

                // Recompute vertex normals and bounding box.
                mesh.geometry.computeVertexNormals();
                mesh.geometry.computeBoundingBox();

                // Add to bounding box if several meshes in model.
                bbox.union(mesh.geometry.boundingBox!);

                mesh.material = new Three.MeshBasicMaterial({
                    color: 0xffff00,
                    wireframe: false,
                });
            } else {
                console.warn('Collada mesh does not meet expectations');
                result = false;
            }
        }
    });

    return [result, bbox];
}
