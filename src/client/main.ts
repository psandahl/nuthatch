import { LabApplication } from './app/LabApplication';
import { Lab3DTilesApplication } from './app/Lab3DTilesApplication';

window.onload = async () => {
    //const app = new LabApplication(window.innerWidth, window.innerHeight);
    const app = new Lab3DTilesApplication(
        window.innerWidth,
        window.innerHeight
    );

    window.onresize = () => {
        app.resize(window.innerWidth, window.innerHeight);
    };

    const tickFrame = () => {
        app.render();
        window.requestAnimationFrame(tickFrame);
    };

    window.requestAnimationFrame(tickFrame);
};
