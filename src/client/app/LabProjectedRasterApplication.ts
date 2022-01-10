import * as Three from 'three';
import Stats from 'three/examples/jsm/libs/stats.module';

import {
    KeyboardEventTag,
    MouseEventTag,
    WheelEventTag,
    Application,
} from './Application';
import { Collada } from 'three/examples/jsm/loaders/ColladaLoader';
import { fetchCollada, modifyTerrainColladaModel } from '../data/ColladaLoad';
import { GeoConvertUtm } from '../math/GeoConvert';
import { ColladaReceiver } from '../types/ColladaReceiver';
import { Size } from '../types/Size';
import { Renderer } from '../render/Renderer';
import { OrbitingNavigator } from '../world/OrbitingNavigator';
import { dummyUrlsLvl12 } from '../data/DummyDataUrls';
import { fetchJSON } from '../data/JSONLoad';
import { JSONReceiver } from '../types/JSONReceiver';
import * as Tracking from '../types/TrackingCamera';
import { TrackingNavigator } from '../world/TrackingNavigator';

export class LabProjectedRasterApplication
    implements Application, ColladaReceiver, JSONReceiver
{
    public constructor(size: Size, canvas: HTMLCanvasElement) {
        this.geoConvertUtm = new GeoConvertUtm(10);
        this.scene = new Three.Scene();

        this.renderer = new Renderer(canvas);
        const [width, height] = size;
        this.renderer.setSize(width, height);

        this.orbitingNavigator = new OrbitingNavigator(50, size);
        this.trackingNavigator = new TrackingNavigator(30, 20, size);

        this.stats = Stats();
        document.body.appendChild(this.stats.dom);

        this.bbox = new Three.Box3();
        this.fetchModelData();

        this.trackTexture = this.setupTrackTexture();

        this.renderTarget = this.setupRenderTarget(size);
        this.quadCamera = new Three.OrthographicCamera(-1, 1, 1, -1, 0, 1);
        this.quadScene = new Three.Scene();
        const quadMesh = this.setupQuadMesh();
        this.quadScene.add(quadMesh);
        this.quadMaterial = quadMesh.material as Three.ShaderMaterial;
    }

    public animationFrame(
        _secondsSinceStart: number,
        _deltaMillis: number
    ): void {
        this.orbitingNavigator.updateCamera();

        this.renderer.setRenderTarget(this.renderTarget);
        this.renderer.render(this.scene, this.orbitingNavigator.getCamera());

        this.renderer.setRenderTarget(null);

        this.quadMaterial.uniforms.uOrbTexture.value =
            this.renderTarget.texture;
        this.quadMaterial.uniforms.uOrbDepth.value =
            this.renderTarget.depthTexture;
        this.quadMaterial.uniforms.uTrackVisibility.value =
            this.trackVisibility;
        this.renderer.render(this.quadScene, this.quadCamera);

        this.stats.update();
    }

    public videoFrame(_secondsSinceStart: number, _deltaMillis: number): void {}

    public resize(size: Size): void {
        this.orbitingNavigator.setSize(size);
        this.trackingNavigator.setSize(size);

        this.renderer.setDrawingArea(this.orbitingNavigator.getDrawingArea());
        const dpr = this.renderer.getPixelRatio();
        const [width, height] = size;
        this.renderTarget.setSize(width * dpr, height * dpr);
    }

    public onKey(tag: KeyboardEventTag, event: KeyboardEvent): void {
        if (tag == KeyboardEventTag.Down) {
            if (event.code == 'KeyN' && this.trackingValid()) {
                this.incTrackIndex();
                this.loadFromTrack();
            } else if (event.code == 'KeyP' && this.trackingValid()) {
                this.decTrackIndex();
                this.loadFromTrack();
            } else if (event.code == 'KeyO') {
                if (this.trackVisibility > 0.0) {
                    this.trackVisibility = 0.0;
                } else {
                    this.trackVisibility = 1.0;
                }
            }
        }
    }

    public onWheel(tag: WheelEventTag, event: WheelEvent): void {
        this.orbitingNavigator.onWheel(tag, event);
    }

    public onMouse(tag: MouseEventTag, event: MouseEvent): void {
        this.orbitingNavigator.onMouse(tag, event);
    }

    public receiveColladaSucceeded(
        model: Collada,
        _id: number,
        _url: string
    ): void {
        const [result, bbox] = modifyTerrainColladaModel(
            this.geoConvertUtm,
            model,
            true
        );
        if (result) {
            this.scene.add(model.scene);

            this.bbox.union(bbox);
            const center = this.bbox.getCenter(new Three.Vector3());

            const normal = center.clone().normalize();
            const camPos = center.clone().addScaledVector(normal, 3000.0);

            this.orbitingNavigator.tiltedAt(camPos);
        }
    }

    public receiveColladaFailed(id: number, url: string): void {
        console.warn(`failed to load collada ${url}`);
    }

    public receiveJSONSucceeded(obj: object, id: number, url: string): void {
        this.track = obj as Tracking.Camera[];
        if (this.track && this.track.length > 0) {
            this.loadFromTrack();
        } else {
            const err = `Unexpected error in converting JSON data from '${url}'`;
            console.error(err);
            alert(err);
        }
    }

    public receiveJSONFailed(_id: number, url: string): void {
        const err = `Failed to load JSON data from '${url}'`;
        console.error(err);
        alert(err);
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

    private setupQuadMesh(): Three.Mesh {
        const geometry = new Three.PlaneGeometry(2, 2);
        const material = new Three.ShaderMaterial({
            vertexShader: vertexSource,
            fragmentShader: fragmentSource,
            uniforms: {
                uOrbTexture: { value: null },
                uOrbDepth: { value: null },
                uTrackTexture: { value: this.trackTexture },
                uOrbCameraFar: {
                    value: this.orbitingNavigator.getCamera().far,
                },
                uTrackVisibility: {
                    value: this.trackVisibility,
                },
                uOrbInverseProjection: {
                    value: this.orbitingNavigator.getCamera()
                        .projectionMatrixInverse,
                },
                uOrbWorldMatrix: {
                    value: this.orbitingNavigator.getCamera().matrixWorld,
                },
                uTrackProjection: {
                    value: this.trackingNavigator.getCamera().projectionMatrix,
                },
                uTrackInverseWorldMatrix: {
                    value: this.trackingNavigator.getCamera()
                        .matrixWorldInverse,
                },
            },
        });

        return new Three.Mesh(geometry, material);
    }

    private setupTrackTexture(): Three.Texture {
        const texture = new Three.Texture();
        texture.wrapS = Three.ClampToEdgeWrapping;
        texture.wrapT = Three.ClampToEdgeWrapping;
        texture.generateMipmaps = true;
        texture.magFilter = Three.LinearFilter;
        texture.minFilter = Three.LinearMipMapLinearFilter;
        texture.needsUpdate = true;

        return texture;
    }

    private fetchModelData(): void {
        const models = dummyUrlsLvl12();
        for (var i = 0; i < models.length; ++i) {
            fetchCollada(i + 1, models[i], this);
        }
        fetchJSON(1, 'testvideo/sequence.json', this);
    }

    private trackingValid(): boolean {
        return this.track.length > 0;
    }

    private incTrackIndex(): void {
        this.trackIndex = (this.trackIndex + 1) % this.track.length;
    }

    private decTrackIndex(): void {
        this.trackIndex = (this.trackIndex - 1) % this.track.length;
        if (this.trackIndex == -1) {
            this.trackIndex = this.track.length - 1;
        }
    }

    private loadFromTrack(): void {
        const cam = this.track[this.trackIndex];
        const url = `testvideo/${cam['frame-id']}.png`;

        const loader = new Three.ImageLoader();
        loader.load(
            url,
            (image) => {
                this.quadMaterial.uniforms.uTrackTexture.value.image = image;
                this.quadMaterial.uniforms.uTrackTexture.value.needsUpdate =
                    true;
                this.trackingNavigator.setViewFromTrackingCamera(cam);
            },
            (_progress) => {},
            (_error) => {
                console.error(`Failed to load image ${url}`);
            }
        );
    }

    private geoConvertUtm: GeoConvertUtm;
    private scene: Three.Scene;
    private renderer: Renderer;
    private orbitingNavigator: OrbitingNavigator;
    private trackingNavigator: TrackingNavigator;
    private stats: Stats;
    private bbox: Three.Box3;

    private track: Tracking.Camera[] = [];
    private trackIndex = 0;
    private trackTexture: Three.Texture;
    private trackVisibility: number = 1.0;

    private renderTarget: Three.WebGLRenderTarget;
    private quadCamera: Three.OrthographicCamera;
    private quadScene: Three.Scene;
    private quadMaterial: Three.ShaderMaterial;
}

const vertexSource = `
varying vec2 vUv;

void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const fragmentSource = `
varying vec2 vUv;
uniform sampler2D uOrbTexture;
uniform sampler2D uOrbDepth;
uniform sampler2D uTrackTexture;
uniform float uOrbCameraFar;
uniform float uTrackVisibility;
uniform mat4 uOrbInverseProjection;
uniform mat4 uOrbWorldMatrix;
uniform mat4 uTrackProjection;
uniform mat4 uTrackInverseWorldMatrix;

// Get the view space depth (positive axis) from a logarithmic depth value.
float logDepthToInvViewZ(in float fragDepth, in float far) {
    float logDepth = fragDepth * log2(far + 1.0);
    return exp2(logDepth) - 1.0;
}

// Reconstruct a fragment from depth and the orbiting view.
vec3 reconstructFragment() {
    // We have UV, transform to NDC.
    vec2 ndc = vUv * 2.0 - 1.0;

    // Create the ray in viewspace.
    vec3 camSpaceRay = normalize((uOrbInverseProjection * vec4(ndc.x, ndc.y, 1.0, 1.0)).xyz);    

    // Lookup the depth for the fragment in the depth texture.
    float fragCoordZ = texture2D(uOrbDepth, vUv).x;

    // Convert to viewspace depth.    
    float viewZ = logDepthToInvViewZ(fragCoordZ, uOrbCameraFar);

    // Calculate the scaling for the ray to reconstruct the fragment's position.
    vec3 front = vec3(0.0, 0.0, -1.0);
    float theta = dot(front, camSpaceRay);
    float rayLen = viewZ / theta;
    
    vec3 camSpacePos = camSpaceRay * rayLen;

    // Reconstruct world space position.
    vec3 worldSpacePos = (uOrbWorldMatrix * vec4(camSpacePos, 1.0)).xyz;

    return worldSpacePos;    
}

void main() {
    vec3 sceneColor = texture2D(uOrbTexture, vUv).rgb;
    vec3 worldPos = reconstructFragment();

    // Reproject the world position in the tracking camera.
    vec4 reprojNdc = uTrackProjection * uTrackInverseWorldMatrix * vec4(worldPos, 1.0);
    reprojNdc /= reprojNdc.w;

    // Filter the reprojected uv, and render the tracking camera's view.
    vec2 reprojUv = (reprojNdc.xy + 1.0) * 0.5;
    if (reprojUv.x >= 0.0 && reprojUv.x <= 1.0 && 
        reprojUv.y >= 0.0 && reprojUv.y <= 1.0) {
        vec3 trackColor = texture2D(uTrackTexture, reprojUv).rgb;
        sceneColor = mix(sceneColor, trackColor, uTrackVisibility);
    }    

    gl_FragColor = vec4(sceneColor, 1.0);
}
`;
