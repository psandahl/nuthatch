import * as Three from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

import {
    Application,
    KeyboardEventTag,
    WheelEventTag,
    MouseEventTag,
} from './Application';
import { Size } from '../types/Size';

export class LabPostprocessApplication implements Application {
    public constructor(size: Size, canvas: HTMLCanvasElement) {
        this.renderer = new Three.WebGLRenderer({
            precision: 'highp',
            logarithmicDepthBuffer: false,
            canvas: canvas,
        });

        if (
            this.renderer.capabilities.isWebGL2 == false &&
            !this.renderer.extensions.get('WEBGL_depth_texture')
        ) {
            console.error('No depth texture support');
            throw new Error('No depth texture support');
        }

        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(size[0], size[1]);

        this.camera = new Three.PerspectiveCamera(
            70,
            window.innerWidth / window.innerHeight,
            0.01,
            1000
        );
        this.camera.position.set(20, 10, 20);
        this.camera.matrix.lookAt(
            new Three.Vector3(20, 10, 20),
            new Three.Vector3(0, 0, 0),
            new Three.Vector3(0, 1, 0)
        );

        this.controls = new OrbitControls(this.camera, canvas);
        this.controls.enableDamping = true;

        this.scene = this.setupScene();
        this.renderTarget = this.setupRenderTarget(size);

        this.quadCamera = new Three.OrthographicCamera(-1, 1, 1, -1, 0, 1);
        this.quadMaterial = new Three.ShaderMaterial({
            vertexShader: vertexSource,
            fragmentShader: fragmentSource,
            uniforms: {
                cameraNear: { value: this.camera.near },
                cameraFar: { value: this.camera.far },
                uTexture: { value: null },
                uDepth: { value: null },
            },
        });

        const quadGeometry = new Three.PlaneGeometry(2, 2);
        const quad = new Three.Mesh(quadGeometry, this.quadMaterial);

        this.quadScene = new Three.Scene();
        this.quadScene.add(quad);
    }

    public animationFrame(
        _secondsSinceStart: number,
        _deltaMillis: number
    ): void {
        this.camera.updateMatrix();

        this.renderer.setRenderTarget(this.renderTarget);
        this.renderer.render(this.scene, this.camera);

        this.renderer.setRenderTarget(null);
        this.quadMaterial.uniforms.uTexture.value = this.renderTarget.texture;
        this.quadMaterial.uniforms.uDepth.value =
            this.renderTarget.depthTexture;
        this.renderer.render(this.quadScene, this.quadCamera);

        this.controls.update();
    }

    public videoFrame(_secondsSinceStart: number, _deltaMillis: number): void {}

    public resize(size: Size): void {
        const [width, height] = size;
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize(width, height);
        const dpr = this.renderer.getPixelRatio();
        this.renderTarget.setSize(width * dpr, height * dpr);
    }

    public onKey(tag: KeyboardEventTag, event: KeyboardEvent): void {}
    public onWheel(tag: WheelEventTag, event: WheelEvent): void {}
    public onMouse(tag: MouseEventTag, event: MouseEvent): void {}

    private setupScene(): Three.Scene {
        const scene = new Three.Scene();
        scene.background = new Three.Color(1 / 255.0, 2 / 255.0, 0x28 / 255);

        const planeGeometry = new Three.PlaneGeometry(25, 25);
        const planeMaterial = new Three.MeshLambertMaterial({
            color: 'darkgray',
            side: Three.DoubleSide,
        });
        const plane = new Three.Mesh(planeGeometry, planeMaterial);
        plane.rotateX(-Math.PI / 2);
        scene.add(plane);

        const boxGeometry = new Three.BoxGeometry(1, 1, 1);
        const boxMaterial = new Three.MeshLambertMaterial({
            color: new Three.Color(46.0 / 255.0, 66.0 / 255.0, 168.0 / 255.0),
        });
        const box = new Three.Mesh(boxGeometry, boxMaterial);

        for (var row = -10; row <= 10; row += 5) {
            for (var col = -10; col <= 10; col += 5) {
                const box0 = box.clone();
                box0.position.set(col, 0.5 + 0.05, row);
                scene.add(box0);
            }
        }

        const ambientLight = new Three.AmbientLight(0xffffff, 0.3);
        const dirLight = new Three.DirectionalLight(0xffffff, 1.0);
        dirLight.position.set(1000, 600, 1000);

        scene.add(ambientLight);
        scene.add(dirLight);

        return scene;
    }

    private setupRenderTarget(size: Size): Three.WebGLRenderTarget {
        const [width, height] = size;

        const target = new Three.WebGLRenderTarget(width, height);

        target.texture.format = Three.RGBFormat;
        target.texture.minFilter = Three.NearestFilter;
        target.texture.magFilter = Three.NearestFilter;
        target.texture.generateMipmaps = false;
        target.stencilBuffer = false;
        target.depthBuffer = true;
        target.depthTexture = new Three.DepthTexture(width, height);
        target.depthTexture.format = Three.DepthFormat;
        target.depthTexture.type = Three.UnsignedIntType;

        return target;
    }

    private renderer: Three.WebGLRenderer;
    private camera: Three.PerspectiveCamera;
    private controls: OrbitControls;
    private scene: Three.Scene;
    private renderTarget: Three.WebGLRenderTarget;

    private quadCamera: Three.OrthographicCamera;
    private quadMaterial: Three.ShaderMaterial;
    private quadScene: Three.Scene;
}

const vertexSource = `
varying vec2 vUv;

void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const fragmentSource = `
#include <packing>

varying vec2 vUv;
uniform sampler2D uTexture;
uniform sampler2D uDepth;
uniform float cameraNear;
uniform float cameraFar;

// Get the view space depth (positive axis) from a logarithmic depth value.
float logDepthToInvViewZ(in float fragDepth, in float far) {
    float logDepth = fragDepth * log2(far + 1.0);
    return exp2(logDepth) - 1.0;
}

float readDepthPerspective() {
    float fragCoordZ = texture2D(uDepth, vUv).x;    
    float viewZ = perspectiveDepthToViewZ(fragCoordZ, cameraNear, cameraFar);    

    //return viewZ;
    return viewZToOrthographicDepth(viewZ, cameraNear, cameraFar);
}

float readDepthLogarithmic() {
    float fragCoordZ = texture2D(uDepth, vUv).x;

    // viewZ is positive
    float viewZ = logDepthToInvViewZ(fragCoordZ, cameraFar);

    return viewZToOrthographicDepth(-viewZ, cameraNear, cameraFar);
}

void main() {
    float depth = readDepthPerspective();
    //float depth = readDepthLogarithmic();       

    vec3 diffuse = texture2D(uTexture, vUv ).rgb;
    gl_FragColor = vec4(diffuse, 1.0);
    
    //gl_FragColor = vec4(vec3(1.0) - vec3(depth), 1.0);
}
`;
