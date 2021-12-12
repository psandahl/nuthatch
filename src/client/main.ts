import { LabApplication } from './app/LabApplication';
import { LabColladaApplication } from './app/LabColladaApplication';
import { LabNavApplication } from './app/LabNavApplication';
import { windowSize } from './types/Size';

window.onload = async () => {
    const app = new LabNavApplication(windowSize());
    //const app = new LabApplication(windowSize());
    //const app = new LabColladaApplication(windowSize());

    window.onresize = () => {
        app.resize(windowSize());
    };

    const tickFrame = () => {
        app.render();
        window.requestAnimationFrame(tickFrame);
    };

    window.requestAnimationFrame(tickFrame);
};
