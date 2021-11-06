import * as Three from 'three';
import Stats from 'three/examples/jsm/libs/stats.module';

import { SceneRenderer } from './render/sceneRenderer';
import { fullDrawingArea } from './render/drawingArea';

window.onload = async () => {
    const scene = new Three.Scene();
    const camera = new Three.PerspectiveCamera(
        45,
        window.innerWidth / window.innerHeight,
        1.0,
        100
    );
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
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();

        renderer.setDrawingArea(
            fullDrawingArea(window.innerWidth, window.innerHeight)
        );
    };
};
