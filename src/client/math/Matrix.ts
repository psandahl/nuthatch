import * as Three from 'three';

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

    return matrix;
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
        Math.atan2(matrix.elements[4], matrix.elements[0]),
        -Math.asin(matrix.elements[8]),
        Math.atan2(matrix.elements[9], matrix.elements[10]),
    ];
}
