import { LabApplication } from './app/LabApplication';
import { Lab3DTilesApplication } from './app/Lab3DTilesApplication';
import { LabNavApplication } from './app/LabNavApplication';

window.onload = async () => {
    const app = new LabNavApplication(window.innerWidth, window.innerHeight);

    window.onresize = () => {
        app.resize(window.innerWidth, window.innerHeight);
    };

    const tickFrame = () => {
        app.render();
        window.requestAnimationFrame(tickFrame);
    };

    window.requestAnimationFrame(tickFrame);
};
