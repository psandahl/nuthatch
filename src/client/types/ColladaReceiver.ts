import { Collada } from 'three/examples/jsm/loaders/ColladaLoader';

export interface ColladaReceiver {
    /**
     * Receive a Collada model.
     * @param model The model
     * @param id The id used in the request
     * @param url The url used in the request
     */
    receiveColladaSucceeded(model: Collada, id: number, url: string): void;

    /**
     * Notification that a model fetch has failed.
     * @param id The is used in the request
     * @param url The url used in the request
     */
    receiveColladaFailed(id: number, url: string): void;
}
