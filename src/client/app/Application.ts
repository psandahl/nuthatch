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

    /**
     * Notification of a timer event (runs at 60 tick/s).
     * @param elapsed The number of milliseconds since last tick.
     */
    tick(elapsed: number): void;
}
