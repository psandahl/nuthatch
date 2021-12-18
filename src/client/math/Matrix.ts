import * as Three from 'three';

import { degToRad } from './Helpers';
import { GeoConvertWgs84 } from './GeoConvert';

/**
 * Create a yaw, pitch, roll rotation matrix for an ECEF reference frame.
 * @param yaw The yaw angle in radians
 * @param pitch The pitch angle in radians
 * @param roll The roll angle in radians
 * @returns The 4x4 matrix.
 */
export function matrixEulerEcef4(
    yaw: number,
    pitch: number,
    roll: number
): Three.Matrix4 {
    const sy = Math.sin(yaw);
    const cy = Math.cos(yaw);
    const sp = Math.sin(pitch);
    const cp = Math.cos(pitch);
    const sr = Math.sin(roll);
    const cr = Math.cos(roll);

    const matrix = new Three.Matrix4();
    matrix.elements = [
        cy * cp,
        cy * sp * sr - sy * cr,
        cy * sp * cr + sy * sr,
        0.0,

        sy * cp,
        sy * sp * sr + cy * cr,
        sy * sp * cr - cy * sr,
        0.0,

        -sp,
        cp * sr,
        cp * cr,
        0.0,

        0.0,
        0.0,
        0.0,
        1.0,
    ];

    return matrix.transpose();
}

/**
 * Decompose a rotation matrix for an ECEF reference frame into yaw, pitch roll.
 * @param matrix The matrix
 * @returns A tuple with yaw, pitch and roll in radians.
 */
export function decomposeMatrixEulerEcef4(
    matrix: Three.Matrix4
): [number, number, number] {
    return [
        Math.atan2(matrix.elements[1], matrix.elements[0]),
        -Math.asin(matrix.elements[2]),
        Math.atan2(matrix.elements[6], matrix.elements[10]),
    ];
}

/**
 * Transform a matrix from ECEF reference frame to NED.
 * @returns A transform matrix from ECEF to NED.
 */
export function matrixEcefToNed4(): Three.Matrix4 {
    return matrixEulerEcef4(0.0, Math.PI, 0.0);
}

/**
 * Transform a matrix from NED reference frame to OpenGL.
 * @returns A transform matrix from NED to OpenGL.
 */
export function matrixNedToGl4(): Three.Matrix4 {
    return matrixEulerEcef4(Math.PI / 2.0, 0.0, -Math.PI / 2.0);
}

/**
 * Transform a matrix from ECEF reference frame to OpenGL.
 * @returns A transform matrix from ECEF to GL viewspace.
 */
export function matrixEcefToGl4(): Three.Matrix4 {
    return new Three.Matrix4().multiplyMatrices(
        matrixEcefToNed4(),
        matrixNedToGl4()
    );
}

/**
 * Create a NED rotation matrix in ECEF (forward is x).
 * @param position The ECEF position
 * @param at The ECEF position where to look
 * @param up The up direction
 * @returns The rotation matrix.
 */
export function matrixLookAtNed4(
    position: Three.Vector3,
    at: Three.Vector3,
    up: Three.Vector3
): Three.Matrix4 {
    // In ECEF, but with NED axis.
    const x = at.clone().sub(position).normalize();
    const y = x.clone().cross(up).normalize();
    const z = new Three.Vector3().crossVectors(y, x).normalize().negate();

    return new Three.Matrix4().makeBasis(x, y, z);
}

/**
 * Create a projection matrix.
 * @param hFov Horizontal fov in radians
 * @param vFov Vertical fov in radians
 * @param near The near plane
 * @param far The far plane
 * @returns A projection matrix.
 */
export function matrixProjection4(
    hFov: number,
    vFov: number,
    near: number,
    far: number
): Three.Matrix4 {
    const matrix = new Three.Matrix4();
    const horizontal = near * Math.tan(hFov / 2.0);
    const vertical = near * Math.tan(vFov / 2.0);
    matrix.makePerspective(
        -horizontal,
        horizontal,
        vertical,
        -vertical,
        near,
        far
    );

    return matrix;
}

/**
 * Create a local NED system for the given position.
 * @param position The ECEF position
 * @param converter The GeoConverter
 * @returns A basis matrix for the local NED system.
 */
export function matrixLocalNed4(
    position: Three.Vector3,
    converter: GeoConvertWgs84
): Three.Matrix4 {
    const wgs84 = converter.ecefToWgs84(position);
    const lat = degToRad(wgs84.x);
    const lon = degToRad(wgs84.y);

    const cosLat = Math.cos(lat);
    const sinLat = Math.sin(lat);
    const cosLon = Math.cos(lon);
    const sinLon = Math.sin(lon);

    const north = new Three.Vector3(-sinLat * cosLon, -sinLat * sinLon, cosLat);
    const east = new Three.Vector3(-sinLon, cosLon, 0.0);
    const down = new Three.Vector3(-cosLat * cosLon, -cosLat * sinLon, -sinLat);

    return new Three.Matrix4().makeBasis(north, east, down);
}

/**
 * Helper function to extract basis vectors.
 * @param matrix A matrix.
 * @returns The basis vectors.
 */
export function extractBasis(
    matrix: Three.Matrix4
): [Three.Vector3, Three.Vector3, Three.Vector3] {
    const x = new Three.Vector3();
    const y = new Three.Vector3();
    const z = new Three.Vector3();

    matrix.extractBasis(x, y, z);

    return [x, y, z];
}
