import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';

export interface GLTFReceiver {
    /**
     *
     * @param model The model
     * @param id The id used in the request
     * @param url The url used in the request
     */
    receiveGLTFSucceeded(model: GLTF, id: number, url: string): void;

    /**
     * Notification that a model fetch has failed.
     * @param id The id used in the request
     * @param url The url used in the request
     */
    receiveGLTFFailed(id: number, url: string): void;
}
