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
     * Notification about animation frame (i.e. time to render).
     * @param secondsSinceStart Seconds since application was loaded
     * @param deltaMillis Milliseconds since last frame
     */
    animationFrame(secondsSinceStart: number, deltaMillis: number): void;

    /**
     * Notification about video frame (e.g. time to move along track).
     * @param secondsSinceStart Seconds since application was loaded
     * @param deltaMillis Milliseconds since last frame
     */
    videoFrame(secondsSinceStart: number, deltaMillis: number): void;

    /**
     * Notification that the window size has changed.
     * @param size The new size.
     */
    resize(size: Size): void;

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
