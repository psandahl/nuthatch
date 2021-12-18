import { AnimationObjectGroup } from 'three';
import { LabApplication } from './app/LabApplication';
import { LabColladaApplication } from './app/LabColladaApplication';
import { LabNavApplication } from './app/LabNavApplication';
import { LabTrackingApplication } from './app/LabTrackingApplication';
import { windowSize } from './types/Size';

window.onload = async () => {
    //const app = new LabNavApplication(windowSize());
    //const app = new LabApplication(windowSize());
    const app = new LabTrackingApplication(windowSize());
    //const app = new LabColladaApplication(windowSize());

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

    window.setInterval(tickMillis, 1000.0 / 60.0);
};
