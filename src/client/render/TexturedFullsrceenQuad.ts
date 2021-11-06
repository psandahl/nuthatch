import * as Three from 'three';

export class TexturedFullscreenQuad {
    /**
     * Create a textured fullscreen quad.
     */
    constructor() {
        const positions = [
            // From upper left position and then ccw.
            -1.0, 1.0, 0.0,

            -1.0, -1.0, 0.0,

            1.0, -1.0, 0.0,

            1.0, 1.0, 0.0,
        ];

        const uvs = [
            // From upper left position and then ccw.
            0.0, 1.0,

            0.0, 0.0,

            1.0, 0.0,

            1.0, 1.0,
        ];

        const indices = [0, 1, 3, 3, 1, 2];

        // Geometry.
        const geometry = new Three.BufferGeometry();
        geometry.setIndex(indices);
        geometry.setAttribute(
            'position',
            new Three.BufferAttribute(new Float32Array(positions), 3)
        );
        geometry.setAttribute(
            'uv',
            new Three.BufferAttribute(new Float32Array(uvs), 2)
        );

        // Material.
        const material = new Three.RawShaderMaterial({
            vertexShader: this.vertexSource,
            fragmentShader: this.fragmentSource,
            depthTest: false,
            depthWrite: false,
            uniforms: {
                uColor: { value: new Three.Vector3(0.0, 0.3, 0.0) },
            },
        });

        // Mesh.
        this._mesh = new Three.Mesh(geometry, material);
        this._mesh.frustumCulled = false;
    }

    /**
     * Get the mesh.
     * @returns The mesh
     */
    public mesh(): Three.Mesh {
        return this._mesh;
    }

    // Dummy for now!
    public updateColor(color: Three.Vector3): void {
        const material = this._mesh.material as Three.RawShaderMaterial;
        material.uniforms.uColor.value = color;
    }

    private _mesh: Three.Mesh;

    // Vertex shader source.
    private readonly vertexSource = `#version 300 es
layout (location = 0) in vec3 position;
layout (location = 1) in vec2 uv;

out vec2 vUv;

void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
}`;

    // Fragment shader source.
    private readonly fragmentSource = `#version 300 es
precision highp float;

uniform vec3 uColor;

in vec2 vUv;
out vec4 color;

void main() {
    color = vec4(uColor, 1.0);
}`;
}
