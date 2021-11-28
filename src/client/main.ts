import { LabApplication } from './app/LabApplication';
import { Lab3DTilesApplication } from './app/Lab3DTilesApplication';
import { LabNavApplication } from './app/LabNavApplication';
import { windowSize } from './types/Size';

window.onload = async () => {
    const app = new LabNavApplication(windowSize());
    //const app = new LabApplication(windowSize());

    window.onresize = () => {
        app.resize(windowSize());
    };

    const tickFrame = () => {
        app.render();
        window.requestAnimationFrame(tickFrame);
    };

    window.requestAnimationFrame(tickFrame);
};
