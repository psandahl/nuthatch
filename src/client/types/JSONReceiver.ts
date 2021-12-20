/**
 * Interface giving the contract of a class receiving JSON data.
 */
export interface JSONReceiver {
    /**
     * Receive a JSON object.
     * @param obj The JSON object
     * @param id The id used in the request
     * @param url The url used in the request
     */
    receiveJSONSucceeded(obj: object, id: number, url: string): void;

    /**
     * Notification that a JSON fetch has failed.
     * @param id The id used in the request
     * @param url The url used in the request
     */
    receiveJSONFailed(id: number, url: string): void;
}
