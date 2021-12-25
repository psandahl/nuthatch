import { AnimationObjectGroup } from 'three';
import {
    KeyboardEventTag,
    MouseEventTag,
    WheelEventTag,
} from './app/Application';
import { LabApplication } from './app/LabApplication';
import { LabColladaApplication } from './app/LabColladaApplication';
import { LabNavApplication } from './app/LabNavApplication';
import { LabTrackingApplication } from './app/LabTrackingApplication';
import { windowSize } from './types/Size';

window.onload = async () => {
    const renderTarget = document.getElementById(
        'rendertarget'
    ) as HTMLCanvasElement;
    if (renderTarget) {
        // Initialize application.
        //const app = new LabNavApplication(windowSize(), renderTarget);
        //const app = new LabApplication(windowSize(), renderTarget);
        const app = new LabTrackingApplication(windowSize(), renderTarget);
        //const app = new LabColladaApplication(windowSize(), renderTarget);

        // Handle window resize.
        window.onresize = () => {
            app.resize(windowSize());
        };

        // Render at animation frames.
        const tickFrame = () => {
            app.render();
            window.requestAnimationFrame(tickFrame);
        };
        window.requestAnimationFrame(tickFrame);

        // Have another tick targeted at 30 FPS for video.
        var currentMillis = new Date().getTime();
        const tickMillis = () => {
            const now = new Date().getTime();
            app.tick(now - currentMillis);
            currentMillis = now;
        };
        window.setInterval(tickMillis, 1000.0 / 30.0);

        // Event handlers.
        renderTarget.onkeydown = (event: KeyboardEvent) => {
            event.preventDefault();
            app.onKey(KeyboardEventTag.Down, event);
        };

        renderTarget.onkeyup = (event: KeyboardEvent) => {
            event.preventDefault();
            app.onKey(KeyboardEventTag.Up, event);
        };

        renderTarget.onwheel = (event: WheelEvent) => {
            event.preventDefault();
            if (event.deltaY > 0) {
                app.onWheel(WheelEventTag.Forward, event);
            } else {
                app.onWheel(WheelEventTag.Backward, event);
            }
        };

        renderTarget.onmousedown = (event: MouseEvent) => {
            event.preventDefault();
            app.onMouse(MouseEventTag.Down, event);
        };

        renderTarget.onmouseup = (event: MouseEvent) => {
            event.preventDefault();
            app.onMouse(MouseEventTag.Up, event);
        };

        renderTarget.onmousemove = (event: MouseEvent) => {
            event.preventDefault();
            app.onMouse(MouseEventTag.Move, event);
        };

        renderTarget.onmouseleave = (event: MouseEvent) => {
            event.preventDefault();
            app.onMouse(MouseEventTag.Leave, event);
        };

        renderTarget.oncontextmenu = (event: MouseEvent) => {
            event.preventDefault();
        };
    } else {
        console.error("Canvas named 'rendertarget' does not exist");
        alert("Error: Canvas named 'rendertarget' does not exist");
    }
};
