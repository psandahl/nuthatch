import * as Three from 'three';
import Stats from 'three/examples/jsm/libs/stats.module';

import { CameraMode, SceneCamera } from './render/SceneCamera';
import { SceneRenderer } from './render/SceneRenderer';
import { calculateDrawingArea, fullDrawingArea } from './render/DrawingArea';

window.onload = async () => {
    const scene = new Three.Scene();
    const camera = new SceneCamera();
    camera.resize(window.innerWidth, window.innerHeight);
    camera.setFov(1.0, 0.7);

    camera.position.z = 5;
    const renderer = new SceneRenderer();

    const geo = new Three.BoxGeometry(1.0, 1.0, 1.0);
    const mat = new Three.MeshBasicMaterial({ color: 0xffff00 });
    const box = new Three.Mesh(geo, mat);
    scene.add(box);

    const stats = Stats();
    document.body.appendChild(stats.dom);

    renderer.setAnimationLoop(() => {
        renderer.render(scene, camera);
        stats.update();
    });

    window.onresize = () => {
        camera.resize(window.innerWidth, window.innerHeight);

        switch (camera.getMode()) {
            case CameraMode.CanvasAdapting:
                renderer.setDrawingArea(
                    fullDrawingArea(window.innerWidth, window.innerHeight)
                );
                break;
            case CameraMode.CameraAdapting:
                renderer.setDrawingArea(
                    calculateDrawingArea(
                        window.innerWidth,
                        window.innerHeight,
                        camera.getAspectRatio()
                    )
                );
                break;
        }
    };

    window.onkeydown = (event: KeyboardEvent) => {
        if (event.code == 'ArrowUp') {
            const [hFov, vFov] = camera.getFov();
            camera.setFov(hFov * 1.05, vFov * 1.05);
        } else if (event.code == 'ArrowDown') {
            const [hFov, vFov] = camera.getFov();
            camera.setFov(hFov * 0.95, vFov * 0.95);
        } else if (event.code == 'KeyC') {
            camera.setMode(CameraMode.CanvasAdapting);
            renderer.setDrawingArea(
                fullDrawingArea(window.innerWidth, window.innerHeight)
            );
        } else if (event.code == 'KeyS') {
            camera.setMode(CameraMode.CameraAdapting);
            renderer.setDrawingArea(
                calculateDrawingArea(
                    window.innerWidth,
                    window.innerHeight,
                    camera.getAspectRatio()
                )
            );
        }
    };
};
