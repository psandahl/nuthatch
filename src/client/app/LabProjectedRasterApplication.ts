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

        this.stats = Stats();
        document.body.appendChild(this.stats.dom);

        this.bbox = new Three.Box3();
        this.fetchModelData();

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

        this.quadMaterial.uniforms.uTexture.value = this.renderTarget.texture;
        this.quadMaterial.uniforms.uDepth.value =
            this.renderTarget.depthTexture;
        this.renderer.render(this.quadScene, this.quadCamera);

        this.stats.update();
    }

    public videoFrame(_secondsSinceStart: number, _deltaMillis: number): void {}

    public resize(size: Size): void {
        this.orbitingNavigator.setSize(size);
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
                uTexture: { value: null },
                uDepth: { value: null },
            },
        });

        return new Three.Mesh(geometry, material);
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
        console.log(cam);
    }

    private geoConvertUtm: GeoConvertUtm;
    private scene: Three.Scene;
    private renderer: Renderer;
    private orbitingNavigator: OrbitingNavigator;
    private stats: Stats;
    private bbox: Three.Box3;

    private renderTarget: Three.WebGLRenderTarget;
    private quadCamera: Three.OrthographicCamera;
    private quadScene: Three.Scene;
    private quadMaterial: Three.ShaderMaterial;

    private track: Tracking.Camera[] = [];
    private trackIndex = 0;
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
uniform sampler2D uTexture;
uniform sampler2D uDepth;

void main() {
    vec3 color = texture2D(uTexture, vUv).rgb;
    color = vec3((color.r + color.g + color.b) / 3.0);
    gl_FragColor = vec4(color, 1.0);
}
`;
