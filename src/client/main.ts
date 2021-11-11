import { LabApplication } from './app/LabApplication';

window.onload = async () => {
    const app = new LabApplication(window.innerWidth, window.innerHeight);

    window.onresize = () => {
        app.resize(window.innerWidth, window.innerHeight);
    };

    const tickFrame = () => {
        app.render();
        window.requestAnimationFrame(tickFrame);
    };

    window.requestAnimationFrame(tickFrame);
};
