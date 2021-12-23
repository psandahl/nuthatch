import * as Three from 'three';
import { DrawingArea, fullDrawingArea } from '../types/DrawingArea';

/**
 * A renderer specialized for rendereing the scene. It is adapted for a
 * scenario where the canvas is filling the whole browser window.
 */
export class SceneRenderer extends Three.WebGLRenderer {
    /**
     * Construct the scene renderer.
     */
    constructor(canvas: HTMLCanvasElement) {
        super({
            antialias: true,
            precision: 'highp',
            logarithmicDepthBuffer: true,
            canvas: canvas,
        });
        this.setScissorTest(true);
        this.setClearColor(new Three.Color(0.0, 0.0, 0.1));
        this.setPixelRatio(window.devicePixelRatio);
        this.domElement.tabIndex = 1;

        document.body.appendChild(this.domElement);

        this.setDrawingArea(
            fullDrawingArea([window.innerWidth, window.innerHeight])
        );
    }

    /**
     * Adjust the renderer's drawing area. Call when the window is
     * resized or when the camera's field of view has changed.
     * @param drawingArea The drawing area
     */
    public setDrawingArea(drawingArea: DrawingArea): void {
        this.setSize(window.innerWidth, window.innerHeight);

        const [x, y, width, height] = drawingArea;
        this.setViewport(x, y, width, height);
        this.setScissor(x, y, width, height);
    }
}
