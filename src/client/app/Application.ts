import { Size } from '../types/Size';

export enum KeyboardEventTag {
    Down,
    Up,
}

export enum WheelEventTag {
    Forward,
    Backward,
}

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

    onKey(tag: KeyboardEventTag, event: KeyboardEvent): void;
    onWheel(tag: WheelEventTag, event: WheelEvent): void;
    onMouse(tag: MouseEventTag, event: MouseEvent): void;
}
