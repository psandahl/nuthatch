import { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

import { GLTFReceiver } from '../types/GLTFReceiver';

/**
 * Fetch a GLTF model.
 * @param id The id of the request
 * @param url The url for the model
 * @param receiver The receiver of the model
 */
export function fetchGLTF(
    id: number,
    url: string,
    receiver: GLTFReceiver
): void {
    const loader = new GLTFLoader();
    loader.load(
        url,
        (model) => {
            receiver.receiveGLTFSucceeded(model, id, url);
        },
        (_progress) => {},
        (_error) => {
            receiver.receiveGLTFFailed(id, url);
        }
    );
}
