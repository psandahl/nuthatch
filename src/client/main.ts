import { AnimationObjectGroup } from 'three';
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
        //const app = new LabNavApplication(windowSize(), renderTarget);
        //const app = new LabApplication(windowSize(), renderTarget);
        const app = new LabTrackingApplication(windowSize(), renderTarget);
        //const app = new LabColladaApplication(windowSize(), renderTarget);

        window.onresize = () => {
            app.resize(windowSize());
        };

        const tickFrame = () => {
            app.render();
            window.requestAnimationFrame(tickFrame);
        };

        window.requestAnimationFrame(tickFrame);

        var currentMillis = new Date().getTime();
        const tickMillis = () => {
            const now = new Date().getTime();
            app.tick(now - currentMillis);
            currentMillis = now;
        };

        window.setInterval(tickMillis, 1000.0 / 30.0);
    } else {
        console.error("Canvas named 'rendertarget' does not exist");
        alert("Error: Canvas named 'rendertarget' does not exist");
    }
};
