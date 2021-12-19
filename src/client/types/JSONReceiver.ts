export interface JSONReceiver {
    receiveJSONSucceeded(obj: object, id: number, url: string): void;

    receiveJSONFailed(id: number, url: string): void;
}
