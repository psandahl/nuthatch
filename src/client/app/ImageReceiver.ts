/**
 * Interface giving the contract of a class receiving images.
 */
export interface ImageReceiver {
    /**
     * Receive an image.
     * @param image The image
     * @param id The id used in the request
     * @param url The url used in the request
     */
    receiveImageSuccessed(
        image: HTMLImageElement,
        id: number,
        url: string
    ): void;

    /**
     * Notification that an image fetch has failed.
     * @param id The id used in the request
     * @param url The url used in the request
     */
    receiveImageFailed(id: number, url: string): void;
}
