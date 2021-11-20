import {
    matrixEulerEcef4,
    decomposeMatrixEulerEcef4,
    matrixEcefToNed4,
    matrixEcefToGl4,
    matrixNedToGl4,
    matrixLocalNed4,
} from '../../../src/client/math/Matrix';

import * as Three from 'three';

import { describe } from 'mocha';
import { expect } from 'chai';
import { GeoConvert } from '../../../src/client/math/GeoConvert';
import { degToRad } from '../../../src/client/math/Helpers';

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

    // Suite to test transformation of ECEF to NED.
    describe('matrixEcefToNed4', () => {
        it('transform ecef to ned', () => {
            const ecef = matrixEulerEcef4(0.15, -1.3, 0.42);
            const ned = new Three.Matrix4().multiplyMatrices(
                ecef,
                matrixEcefToNed4()
            );

            const ecefX = new Three.Vector3();
            const ecefY = new Three.Vector3();
            const ecefZ = new Three.Vector3();
            ecef.extractBasis(ecefX, ecefY, ecefZ);

            const nedX = new Three.Vector3();
            const nedY = new Three.Vector3();
            const nedZ = new Three.Vector3();
            ned.extractBasis(nedX, nedY, nedZ);

            // X axes shall be flipped.
            expect(nedX.x).to.be.closeTo(-ecefX.x, Number.EPSILON);
            expect(nedX.y).to.be.closeTo(-ecefX.y, Number.EPSILON);
            expect(nedX.z).to.be.closeTo(-ecefX.z, Number.EPSILON);

            // Y axes shall be unchanged.
            expect(nedY.x).to.be.closeTo(ecefY.x, Number.EPSILON);
            expect(nedY.y).to.be.closeTo(ecefY.y, Number.EPSILON);
            expect(nedY.z).to.be.closeTo(ecefY.z, Number.EPSILON);

            // Z axes shall be flipped.
            expect(nedZ.x).to.be.closeTo(-ecefZ.x, Number.EPSILON);
            expect(nedZ.y).to.be.closeTo(-ecefZ.y, Number.EPSILON);
            expect(nedZ.z).to.be.closeTo(-ecefZ.z, Number.EPSILON);
        });
    });

    // Suite to test transformation of NED to OpenGL.
    describe('matrixNedToGl4', () => {
        it('transform ned to opengl', () => {
            const ned = matrixEulerEcef4(0.15, -1.3, 0.42); // Image this is ned.
            const gl = new Three.Matrix4().multiplyMatrices(
                ned,
                matrixNedToGl4()
            );

            const nedX = new Three.Vector3();
            const nedY = new Three.Vector3();
            const nedZ = new Three.Vector3();
            ned.extractBasis(nedX, nedY, nedZ);

            const glX = new Three.Vector3();
            const glY = new Three.Vector3();
            const glZ = new Three.Vector3();
            gl.extractBasis(glX, glY, glZ);

            // Gl X shall be equal to Ned Y.
            expect(glX.x).to.be.closeTo(nedY.x, Number.EPSILON);
            expect(glX.y).to.be.closeTo(nedY.y, Number.EPSILON);
            expect(glX.z).to.be.closeTo(nedY.z, Number.EPSILON);

            // Gl Y shall be equal to Ned -Z
            expect(glY.x).to.be.closeTo(-nedZ.x, Number.EPSILON);
            expect(glY.y).to.be.closeTo(-nedZ.y, Number.EPSILON);
            expect(glY.z).to.be.closeTo(-nedZ.z, Number.EPSILON);

            // Gl Z shall be equal to Ned -X
            expect(glZ.x).to.be.closeTo(-nedX.x, Number.EPSILON);
            expect(glZ.y).to.be.closeTo(-nedX.y, Number.EPSILON);
            expect(glZ.z).to.be.closeTo(-nedX.z, Number.EPSILON);
        });
    });

    // Suite to test transformation of ECEF to OpenGL.
    describe('matrixEcefToGl4', () => {
        it('transform ecef to opengl', () => {
            const ecef = matrixEulerEcef4(0.15, -1.3, 0.42);
            const gl = new Three.Matrix4().multiplyMatrices(
                ecef,
                matrixEcefToGl4()
            );

            const ecefX = new Three.Vector3();
            const ecefY = new Three.Vector3();
            const ecefZ = new Three.Vector3();
            ecef.extractBasis(ecefX, ecefY, ecefZ);

            const glX = new Three.Vector3();
            const glY = new Three.Vector3();
            const glZ = new Three.Vector3();
            gl.extractBasis(glX, glY, glZ);

            // Gl X shall be equal to Ecef Y
            expect(glX.x).to.be.closeTo(ecefY.x, Number.EPSILON);
            expect(glX.y).to.be.closeTo(ecefY.y, Number.EPSILON);
            expect(glX.z).to.be.closeTo(ecefY.z, Number.EPSILON);

            // Gl Y shall be equal to Ecef Z
            expect(glY.x).to.be.closeTo(ecefZ.x, Number.EPSILON);
            expect(glY.y).to.be.closeTo(ecefZ.y, Number.EPSILON);
            expect(glY.z).to.be.closeTo(ecefZ.z, Number.EPSILON);

            // Gl Z shall be equal to Ecef X
            expect(glZ.x).to.be.closeTo(ecefX.x, Number.EPSILON);
            expect(glZ.y).to.be.closeTo(ecefX.y, Number.EPSILON);
            expect(glZ.z).to.be.closeTo(ecefX.z, Number.EPSILON);
        });
    });

    describe('matrixLocalNed4', () => {
        const converter = new GeoConvert();
        const north = new Three.Vector3();
        const east = new Three.Vector3();
        const down = new Three.Vector3();

        it('ned at lat:0 lon:0', () => {
            const ecef = converter.wgs84ToEcef(new Three.Vector3(0, 0, 0));
            const mat = matrixLocalNed4(ecef, converter);
            mat.extractBasis(north, east, down);

            expect(north.x).to.be.closeTo(0.0, Number.EPSILON);
            expect(north.y).to.be.closeTo(0.0, Number.EPSILON);
            expect(north.z).to.be.closeTo(1.0, Number.EPSILON);

            expect(east.x).to.be.closeTo(0.0, Number.EPSILON);
            expect(east.y).to.be.closeTo(1.0, Number.EPSILON);
            expect(east.z).to.be.closeTo(0.0, Number.EPSILON);

            expect(down.x).to.be.closeTo(-1.0, Number.EPSILON);
            expect(down.y).to.be.closeTo(0.0, Number.EPSILON);
            expect(down.z).to.be.closeTo(0.0, Number.EPSILON);
        });

        it('ned at lat:0 lon:90', () => {
            const ecef = converter.wgs84ToEcef(new Three.Vector3(0, 90, 0));
            const mat = matrixLocalNed4(ecef, converter);
            mat.extractBasis(north, east, down);

            expect(north.x).to.be.closeTo(0.0, Number.EPSILON);
            expect(north.y).to.be.closeTo(0.0, Number.EPSILON);
            expect(north.z).to.be.closeTo(1.0, Number.EPSILON);

            expect(east.x).to.be.closeTo(-1.0, Number.EPSILON);
            expect(east.y).to.be.closeTo(0.0, Number.EPSILON);
            expect(east.z).to.be.closeTo(0.0, Number.EPSILON);

            expect(down.x).to.be.closeTo(0.0, Number.EPSILON);
            expect(down.y).to.be.closeTo(-1.0, Number.EPSILON);
            expect(down.z).to.be.closeTo(0.0, Number.EPSILON);
        });

        it('ned at lat:58 lon:14', () => {
            const ecef = converter.wgs84ToEcef(new Three.Vector3(58, 14, 0));
            const mat = matrixLocalNed4(ecef, converter);
            mat.extractBasis(north, east, down);

            const z = new Three.Vector3(0.0, 0.0, 1.0);
            const up = down.clone().negate();
            const angleLat = Math.acos(z.dot(up));
            expect(angleLat).to.be.closeTo(degToRad(90 - 58), Number.EPSILON);

            const normal = ecef.clone().normalize();
            expect(normal.dot(down)).to.be.closeTo(-1.0, 0.00001);

            expect(north.dot(down)).to.be.closeTo(0.0, Number.EPSILON);
            expect(north.dot(east)).to.be.closeTo(0.0, Number.EPSILON);
            expect(east.dot(down)).to.be.closeTo(0.0, Number.EPSILON);
        });
    });
});
