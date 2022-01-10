import * as Three from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

import {
    Application,
    KeyboardEventTag,
    WheelEventTag,
    MouseEventTag,
} from './Application';
import { Raycaster } from '../world/Raycaster';
import { Size } from '../types/Size';
import { fullDrawingArea } from '../types/DrawingArea';
import { pxToUv, uvToWorldRay } from '../math/CameraTransforms';

export class LabPostprocessApplication implements Application {
    public constructor(size: Size, canvas: HTMLCanvasElement) {
        this.size = size;

        this.renderer = new Three.WebGLRenderer({
            precision: 'highp',
            logarithmicDepthBuffer: true,
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
            35,
            window.innerWidth / window.innerHeight,
            0.01,
            1000000
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

        this.raycaster = new Raycaster(this.scene);

        this.quadCamera = new Three.OrthographicCamera(-1, 1, 1, -1, 0, 1);
        this.quadMaterial = new Three.ShaderMaterial({
            vertexShader: vertexSource,
            fragmentShader: fragmentSource,
            uniforms: {
                uCameraNear: { value: this.camera.near },
                uCameraFar: { value: this.camera.far },
                uInverseProjection: {
                    value: this.camera.projectionMatrixInverse,
                },
                uWorldMatrix: {
                    value: this.camera.matrixWorld,
                },
                uTexture: { value: null },
                uDepth: { value: null },
                uIntersectPoint: { value: new Three.Vector3() },
                uValidIntersect: { value: false },
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

        const intersection = this.raycaster.intersect(this.getWorldRay());
        if (intersection) {
            this.quadMaterial.uniforms.uIntersectPoint.value.copy(
                intersection.point
            );
            this.quadMaterial.uniforms.uValidIntersect.value = true;
        } else {
            this.quadMaterial.uniforms.uValidIntersect.value = false;
        }

        this.renderer.render(this.quadScene, this.quadCamera);

        this.controls.update();
    }

    public videoFrame(_secondsSinceStart: number, _deltaMillis: number): void {}

    public resize(size: Size): void {
        this.size = size;
        this.mousePos = undefined;

        const [width, height] = size;
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize(width, height);
        const dpr = this.renderer.getPixelRatio();
        this.renderTarget.setSize(width * dpr, height * dpr);
    }

    public onKey(tag: KeyboardEventTag, event: KeyboardEvent): void {}
    public onWheel(tag: WheelEventTag, event: WheelEvent): void {}
    public onMouse(tag: MouseEventTag, event: MouseEvent): void {
        if (tag != MouseEventTag.Leave) {
            this.mousePos = new Three.Vector2(event.clientX, event.clientY);
        } else {
            this.mousePos = undefined;
        }
    }

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

    private getWorldRay(): Three.Ray | undefined {
        if (this.mousePos) {
            const uv = pxToUv(fullDrawingArea(this.size), this.mousePos);
            return uvToWorldRay(
                this.camera.projectionMatrixInverse,
                this.camera.matrixWorld,
                uv
            );
        } else {
            return undefined;
        }
    }

    private size: Size;
    private renderer: Three.WebGLRenderer;
    private camera: Three.PerspectiveCamera;
    private controls: OrbitControls;
    private scene: Three.Scene;
    private renderTarget: Three.WebGLRenderTarget;
    private mousePos?: Three.Vector2;
    private raycaster: Raycaster;

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
uniform float uCameraNear;
uniform float uCameraFar;
uniform mat4 uInverseProjection;
uniform mat4 uWorldMatrix;
uniform vec3 uIntersectPoint;
uniform bool uValidIntersect;

// Get the view space depth (positive axis) from a logarithmic depth value.
float logDepthToInvViewZ(in float fragDepth, in float far) {
    float logDepth = fragDepth * log2(far + 1.0);
    return exp2(logDepth) - 1.0;
}

// Reconstruct a fragment from depth.
vec3 reconstructFragment() {
    // We have UV, transform to NDC.
    vec2 ndc = vUv * 2.0 - 1.0;

    // Create the ray in viewspace.
    vec3 camSpaceRay = normalize((uInverseProjection * vec4(ndc.x, ndc.y, 1.0, 1.0)).xyz);    

    // Lookup the depth for the fragment in the depth texture.
    float fragCoordZ = texture2D(uDepth, vUv).x;

    // Convert to viewspace depth.
    //float viewZ = abs(perspectiveDepthToViewZ(fragCoordZ, uCameraNear, uCameraFar));
    float viewZ = logDepthToInvViewZ(fragCoordZ, uCameraFar);

    // Calculate the scaling for the ray to reconstruct the fragment's position.
    vec3 front = vec3(0.0, 0.0, -1.0);
    float theta = dot(front, camSpaceRay);
    float rayLen = viewZ / theta;
    
    vec3 camSpacePos = camSpaceRay * rayLen;

    vec3 worldSpacePos = (uWorldMatrix * vec4(camSpacePos, 1.0)).xyz;

    return worldSpacePos;    
}

void main() {    
    vec3 color = texture2D(uTexture, vUv).rgb;

    if (uValidIntersect) {
        vec3 worldPos = reconstructFragment();
        // If we have a reconstruction - render range rings.
        float dist = distance(uIntersectPoint.xz, worldPos.xz);
        if (dist < 0.1) {
            color = vec3(1.0, 0.0, 0.0);
        } else if (dist < 4.95) {
            color = mix(color, vec3(1.0, 1.0, 0.0), 0.5);
        } else if (dist >= 4.95 && dist <= 5.0) {
            color = vec3(0.0);
        }
    }

    gl_FragColor = vec4(color, 1.0);    
}
`;
