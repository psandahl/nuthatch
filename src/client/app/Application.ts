import { Size } from '../types/Size';

/**
 * Interface giving the basic contract for an application.
 */
export interface Application {
    /**
     * Notification to render the screen.
     */
    render(): void;

    /**
     * Notification that the window size has changed.
     * @param size The new size.
     */
    resize(size: Size): void;
}
