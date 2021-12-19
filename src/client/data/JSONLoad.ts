import { JSONReceiver } from '../types/JSONReceiver';

export function fetchJSON(
    id: number,
    url: string,
    receiver: JSONReceiver
): void {
    fetch(url)
        .then((response) => response.json())
        .then((obj) => receiver.receiveJSONSucceeded(obj, id, url))
        .catch((_err) => receiver.receiveJSONFailed(id, url));
}
