import * as Three from 'three';

/**
 * A textured fullscreen quad, which can have its texture updated and be
 * accompanied with projection and distortion information so that
 * images can be undistorted.
 */
export class TexturedFullscreenQuad {
    /**
     * Create a textured fullscreen quad.
     */
    constructor() {
        const positions = [
            // From upper left position and then ccw.
            -1.2, 1.2, 1.0,

            -1.2, -1.2, 1.0,

            1.2, -1.2, 1.0,

            1.2, 1.2, 1.0,
        ];

        const indices = [0, 1, 3, 3, 1, 2];

        // Geometry.
        const geometry = new Three.BufferGeometry();
        geometry.setIndex(indices);
        geometry.setAttribute(
            'position',
            new Three.BufferAttribute(new Float32Array(positions), 3)
        );

        // Texture.
        const texture = new Three.Texture();
        texture.wrapS = Three.ClampToEdgeWrapping;
        texture.wrapT = Three.ClampToEdgeWrapping;
        texture.generateMipmaps = true;
        texture.magFilter = Three.LinearFilter;
        texture.minFilter = Three.LinearMipMapLinearFilter;
        texture.needsUpdate = true;

        // Material.
        const material = new Three.RawShaderMaterial({
            vertexShader: this.vertexSource,
            fragmentShader: this.fragmentSource,
            depthTest: false,
            depthWrite: false,
            uniforms: {
                uProjection: { value: new Three.Matrix4() },
                uInverseProjection: { value: new Three.Matrix4() },
                uCoeff: { value: new Three.Vector3() },
                uTexture: { value: texture },
            },
        });

        // Mesh.
        this._mesh = new Three.Mesh(geometry, material);
        this._mesh.frustumCulled = false;

        // Note: Change the raycast callback to disable intersection.
        this._mesh.raycast = (
            raycaster: Three.Raycaster,
            intersects: Three.Intersection<Three.Object3D<Three.Event>>[]
        ): void => {};

        this._coeff = new Three.Vector3();
    }

    /**
     * Get the mesh.
     * @returns The mesh
     */
    public mesh(): Three.Mesh {
        return this._mesh;
    }

    /**
     * Update the quad with new camera metadata.
     * @param projection The projection matrix
     * @param inverseProjection The inverse projection matrix
     * @param coeff The distortion coeffients
     */
    public updataCameraMetadata(
        projection: Three.Matrix4,
        inverseProjection: Three.Matrix4,
        coeff: Three.Vector3
    ): void {
        this._coeff = coeff;

        const material = this._mesh.material as Three.RawShaderMaterial;
        material.uniforms.uProjection.value = projection;
        material.uniforms.uInverseProjection.value = inverseProjection;
        if (this._undistort) {
            material.uniforms.uCoeff.value = coeff;
        } else {
            material.uniforms.uCoeff.value = new Three.Vector3();
        }
    }

    /**
     * Update the quad with a new image.
     * @param image The image
     */
    public updateTexture(image: HTMLImageElement): void {
        const material = this._mesh.material as Three.RawShaderMaterial;
        material.uniforms.uTexture.value.image = image;
        material.uniforms.uTexture.value.needsUpdate = true;
    }

    /**
     * Toggle undistorsion.
     */
    public toggleUndistort(): void {
        const material = this._mesh.material as Three.RawShaderMaterial;
        this._undistort = !this._undistort;
        if (this._undistort) {
            material.uniforms.uCoeff.value = this._coeff;
        } else {
            material.uniforms.uCoeff.value = new Three.Vector3();
        }
    }

    /**
     * Toggle visibility.
     */
    public toggleVisibility(): void {
        this._mesh.visible = !this._mesh.visible;
    }

    private _mesh: Three.Mesh;
    private _coeff: Three.Vector3;
    private _undistort = true;

    // Vertex shader source.
    private readonly vertexSource = `#version 300 es
layout (location = 0) in vec3 position;

out vec3 vPosition;

void main() {    
    vPosition = position;
    gl_Position = vec4(position, 1.0);
}`;

    // Fragment shader source.
    private readonly fragmentSource = `#version 300 es
precision highp float;

uniform mat4 uProjection;
uniform mat4 uInverseProjection;
uniform vec3 uCoeff;
uniform sampler2D uTexture;

in vec3 vPosition;
out vec4 color;

void main() {    
    vec2 uv0 = vPosition.xy * 0.5 + 0.5;
    vec4 viewSpace = uInverseProjection * vec4(vPosition, 1.0);    
    viewSpace /= -viewSpace.z;

    float r = length(viewSpace.xy);
    float r2 = r * r;
    float r3 = r2 * r;
    float r4 = r2 * r2;

    float k2 = uCoeff.x;
    float k3 = uCoeff.y;
    float k4 = uCoeff.z;

    float scale = 1.0 + (r2 * k2 + r3 * k3 + r4 * k4);
    viewSpace.xyz *= scale;
    viewSpace.z = 1.0;

    vec4 pos1 = uProjection * viewSpace;
    vec2 uv1 = pos1.xy * 0.5 + 0.5;

    if (uv1.x < 0.0 || uv1.x > 1.0 || uv1.y < 0.0 || uv1.y > 1.0) {
        color = vec4(0.0, 0.0, 0.0, 1.0);
    } else {
        color = vec4(texture(uTexture, uv1).rgb, 1.0);
    }
}`;
}
