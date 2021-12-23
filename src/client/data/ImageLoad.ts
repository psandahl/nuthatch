import * as Three from 'three';

import { ImageReceiver } from '../types/ImageReceiver';

/**
 * Asynchronously load fetch an image an give it to the receiver.
 * @param id The id for the request
 * @param url The url for the image
 * @param receiver The receiver
 */
export function fetchImage(
    id: number,
    url: string,
    receiver: ImageReceiver
): void {
    const loader = new Three.ImageLoader();
    loader.load(
        url,
        (image) => receiver.receiveImageSucceeded(image, id, url),
        (_error) => receiver.receiveImageFailed(id, url)
    );
}