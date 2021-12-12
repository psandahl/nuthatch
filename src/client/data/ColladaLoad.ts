import * as Three from 'three';
import {
    Collada,
    ColladaLoader,
} from 'three/examples/jsm/loaders/ColladaLoader';

import { ColladaReceiver } from '../types/ColladaReceiver';
import { GeoConvertUtm } from '../math/GeoConvert';

/**
 * Fetch a collada model.
 * @param id The id of the request
 * @param url The urls for the model
 * @param receiver The receiver of the model
 */
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

/**
 * Convert a Collada model to ECEF.
 * @param convert The UTM to ECEF converter
 * @param model The model to be converted.
 * @returns Status of conversion plus bounding box.
 */
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

                // The mesh matrices and position must be reset.
                mesh.matrix = new Three.Matrix4();
                mesh.matrixWorld = new Three.Matrix4();
                mesh.normalMatrix.copy(new Three.Matrix3());
                mesh.quaternion.copy(new Three.Quaternion());
                mesh.position.set(0, 0, 0);

                // Recompute vertex normals and bounding box.
                mesh.geometry.computeVertexNormals();
                mesh.geometry.computeBoundingBox();

                // Add to bounding box if several meshes in model.
                bbox.union(mesh.geometry.boundingBox!);

                //mesh.material = new Three.MeshNormalMaterial();
            } else {
                console.warn('Collada mesh does not meet expectations');
                result = false;
            }
        }
    });

    model.scene.matrix = new Three.Matrix4();
    model.scene.matrixWorld = new Three.Matrix4();
    model.scene.quaternion.copy(new Three.Quaternion());
    model.scene.position.set(0, 0, 0);

    return [result, bbox];
}
