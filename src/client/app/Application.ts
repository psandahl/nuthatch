import { Size } from '../types/Size';

/**
 * Keyboard event tag.
 */
export enum KeyboardEventTag {
    Down,
    Up,
}

/**
 * Wheel event tag.
 */
export enum WheelEventTag {
    Forward,
    Backward,
}

/**
 * Mouse event tag.
 */
export enum MouseEventTag {
    Down,
    Up,
    Move,
    Leave,
}

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
     * Notification of a timer event (runs at 30 tick/s).
     * @param elapsed The number of milliseconds since last tick.
     */
    tick(elapsed: number): void;

    /**
     * Notification of a keyboard event.
     * @param tag The event tag
     * @param event The event
     */
    onKey(tag: KeyboardEventTag, event: KeyboardEvent): void;

    /**
     * Notification of a wheel event.
     * @param tag The event tag
     * @param event The event
     */
    onWheel(tag: WheelEventTag, event: WheelEvent): void;

    /**
     * Notification of a mouse event.
     * @param tag The event tag
     * @param event The event
     */
    onMouse(tag: MouseEventTag, event: MouseEvent): void;
}
