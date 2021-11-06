import {
    matrixEulerEcef4,
    decomposeMatrixEulerEcef4,
} from '../../../src/client/math/matrix';

import * as Three from 'three';

import { describe } from 'mocha';
import { expect } from 'chai';

describe('matrix tests', () => {
    // Suite to test ECEF rotations.
    describe('apply matrixEulerEcef4', () => {
        it('zero rotation', () => {
            const rotated = new Three.Vector3(1.0, 0.0, 0.0).applyMatrix4(
                matrixEulerEcef4(0.0, 0.0, 0.0)
            );
            const expected = new Three.Vector3(1.0, 0.0, 0.0);
            expect(rotated.x).to.be.closeTo(expected.x, Number.EPSILON);
            expect(rotated.y).to.be.closeTo(expected.y, Number.EPSILON);
            expect(rotated.z).to.be.closeTo(expected.z, Number.EPSILON);
        });

        it('90 deg yaw rotation', () => {
            const rotated = new Three.Vector3(1.0, 0.0, 0.0).applyMatrix4(
                matrixEulerEcef4(Math.PI / 2.0, 0.0, 0.0)
            );
            const expected = new Three.Vector3(0.0, -1.0, 0.0);
            expect(rotated.x).to.be.closeTo(expected.x, Number.EPSILON);
            expect(rotated.y).to.be.closeTo(expected.y, Number.EPSILON);
            expect(rotated.z).to.be.closeTo(expected.z, Number.EPSILON);
        });

        it('90 deg pitch rotation', () => {
            const rotated = new Three.Vector3(1.0, 0.0, 0.0).applyMatrix4(
                matrixEulerEcef4(0.0, Math.PI / 2.0, 0.0)
            );
            const expected = new Three.Vector3(0.0, 0.0, 1.0);
            expect(rotated.x).to.be.closeTo(expected.x, Number.EPSILON);
            expect(rotated.y).to.be.closeTo(expected.y, Number.EPSILON);
            expect(rotated.z).to.be.closeTo(expected.z, Number.EPSILON);
        });

        it('90 deg roll rotation', () => {
            const rotated = new Three.Vector3(0.0, 0.0, 1.0).applyMatrix4(
                matrixEulerEcef4(0.0, 0.0, Math.PI / 2.0)
            );
            const expected = new Three.Vector3(0.0, 1.0, 0.0);
            expect(rotated.x).to.be.closeTo(expected.x, Number.EPSILON);
            expect(rotated.y).to.be.closeTo(expected.y, Number.EPSILON);
            expect(rotated.z).to.be.closeTo(expected.z, Number.EPSILON);
        });
    });

    // Suite to test decomposition of the ECEF rotation.
    describe('decomposeMatrixEulerEcef4', () => {
        it('decompose zero rotation', () => {
            const matrix = matrixEulerEcef4(0.0, 0.0, 0.0);
            const [yaw, pitch, roll] = decomposeMatrixEulerEcef4(matrix);
            expect(yaw).to.be.closeTo(0.0, Number.EPSILON);
            expect(pitch).to.be.closeTo(0.0, Number.EPSILON);
            expect(roll).to.be.closeTo(0.0, Number.EPSILON);
        });

        it('decompose yaw rotation', () => {
            const matrix = matrixEulerEcef4(0.42, 0.0, 0.0);
            const [yaw, pitch, roll] = decomposeMatrixEulerEcef4(matrix);
            expect(yaw).to.be.closeTo(0.42, Number.EPSILON);
            expect(pitch).to.be.closeTo(0.0, Number.EPSILON);
            expect(roll).to.be.closeTo(0.0, Number.EPSILON);
        });

        it('decompose pitch rotation', () => {
            const matrix = matrixEulerEcef4(0.0, 0.42, 0.0);
            const [yaw, pitch, roll] = decomposeMatrixEulerEcef4(matrix);
            expect(yaw).to.be.closeTo(0.0, Number.EPSILON);
            expect(pitch).to.be.closeTo(0.42, Number.EPSILON);
            expect(roll).to.be.closeTo(0.0, Number.EPSILON);
        });

        it('decompose roll rotation', () => {
            const matrix = matrixEulerEcef4(0.0, 0.0, 0.42);
            const [yaw, pitch, roll] = decomposeMatrixEulerEcef4(matrix);
            expect(yaw).to.be.closeTo(0.0, Number.EPSILON);
            expect(pitch).to.be.closeTo(0.0, Number.EPSILON);
            expect(roll).to.be.closeTo(0.42, Number.EPSILON);
        });

        it('decompose full rotation', () => {
            const matrix = matrixEulerEcef4(0.15, -1.3, 0.42);
            const [yaw, pitch, roll] = decomposeMatrixEulerEcef4(matrix);
            expect(yaw).to.be.closeTo(0.15, Number.EPSILON);
            expect(pitch).to.be.closeTo(-1.3, Number.EPSILON);
            expect(roll).to.be.closeTo(0.42, Number.EPSILON);
        });
    });
});
