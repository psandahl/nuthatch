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
     * @param width The new width
     * @param height The new height
     */
    resize(width: number, height: number): void;
}
