import {
    KeyboardEventTag,
    MouseEventTag,
    WheelEventTag,
} from './app/Application';
import { DemoApplication } from './app/DemoApplication';
import { LabQuadApplication } from './app/LabQuadApplication';
import { LabColladaApplication } from './app/LabColladaApplication';
import { LabNavApplication } from './app/LabNavApplication';
import { LabTrackingApplication } from './app/LabTrackingApplication';
import { LabPostprocessApplication } from './app/LabPostprocessApplication';
import { windowSize } from './types/Size';

window.onload = async () => {
    const renderTarget = document.getElementById(
        'rendertarget'
    ) as HTMLCanvasElement;
    if (renderTarget) {
        const startTime = performance.now();

        // Initialize application.
        const app = new DemoApplication(windowSize(), renderTarget);
        //const app = new LabNavApplication(windowSize(), renderTarget);
        //const app = new LabQuadApplication(windowSize(), renderTarget);
        //const app = new LabTrackingApplication(windowSize(), renderTarget);
        //const app = new LabColladaApplication(windowSize(), renderTarget);
        //const app = new LabPostprocessApplication(windowSize(), renderTarget);

        // Handle window resize.
        window.onresize = () => {
            app.resize(windowSize());
        };

        // Render at animation frames.
        var lastAnimation = startTime;
        const tickAnimation = () => {
            const now = performance.now();
            const secondsSinceStart = (now - startTime) / 1000.0;
            const deltaMillis = now - lastAnimation;
            lastAnimation = now;

            app.animationFrame(secondsSinceStart, deltaMillis);
            window.requestAnimationFrame(tickAnimation);
        };
        window.requestAnimationFrame(tickAnimation);

        // Have another tick targeted at 30 FPS for video.
        var lastVideo = startTime;
        const tickVideo = () => {
            const now = performance.now();
            const secondsSinceStart = (now - startTime) / 1000.0;
            const deltaMillis = now - lastVideo;
            lastVideo = now;

            app.videoFrame(secondsSinceStart, deltaMillis);
        };
        window.setInterval(tickVideo, 1000.0 / 30.0);

        // Event handlers.
        window.onkeydown = (event: KeyboardEvent) => {
            if (
                event.code != 'F5' &&
                event.code != 'F11' &&
                event.code != 'F12'
            ) {
                event.preventDefault();
                app.onKey(KeyboardEventTag.Down, event);
            }
        };

        window.onkeyup = (event: KeyboardEvent) => {
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
