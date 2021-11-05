import * as Three from 'three';
import Stats from 'three/examples/jsm/libs/stats.module';

window.onload = async () => {
    const scene = new Three.Scene();
    const camera = new Three.PerspectiveCamera(
        45,
        window.innerWidth / window.innerHeight,
        1.0,
        100
    );
    camera.position.z = 5;
    const renderer = new Three.WebGLRenderer({
        antialias: true,
        precision: 'highp',
        logarithmicDepthBuffer: true,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(new Three.Color(0.0, 0.1, 0.2));
    document.body.appendChild(renderer.domElement);

    const stats = Stats();
    document.body.appendChild(stats.dom);

    renderer.setAnimationLoop(() => {
        renderer.render(scene, camera);
        stats.update();
    });
};

window.onresize = () => {
    console.log('Resized');
};
