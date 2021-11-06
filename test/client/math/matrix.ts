import {
    matrixEulerEcef4,
    decomposeMatrixEulerEcef4,
} from '../../../src/client/math/matrix';

import { describe } from 'mocha';
import { expect } from 'chai';

describe('matrix tests', () => {
    // Suite to test decomposition of the ECEF rotation.
    describe('decomposeMatrixEulerEcef4', () => {
        it('decompose zero rotation', () => {
            const matrix = matrixEulerEcef4(0.0, 0.0, 0.0);
            const [yaw, pitch, roll] = decomposeMatrixEulerEcef4(matrix);
            expect(yaw).to.approximately(0.0, Number.EPSILON);
            expect(pitch).to.approximately(0.0, Number.EPSILON);
            expect(roll).to.approximately(0.0, Number.EPSILON);
        });

        it('decompose yaw rotation', () => {
            const matrix = matrixEulerEcef4(0.42, 0.0, 0.0);
            const [yaw, pitch, roll] = decomposeMatrixEulerEcef4(matrix);
            expect(yaw).to.approximately(0.42, Number.EPSILON);
            expect(pitch).to.approximately(0.0, Number.EPSILON);
            expect(roll).to.approximately(0.0, Number.EPSILON);
        });

        it('decompose pitch rotation', () => {
            const matrix = matrixEulerEcef4(0.0, 0.42, 0.0);
            const [yaw, pitch, roll] = decomposeMatrixEulerEcef4(matrix);
            expect(yaw).to.approximately(0.0, Number.EPSILON);
            expect(pitch).to.approximately(0.42, Number.EPSILON);
            expect(roll).to.approximately(0.0, Number.EPSILON);
        });

        it('decompose roll rotation', () => {
            const matrix = matrixEulerEcef4(0.0, 0.0, 0.42);
            const [yaw, pitch, roll] = decomposeMatrixEulerEcef4(matrix);
            expect(yaw).to.approximately(0.0, Number.EPSILON);
            expect(pitch).to.approximately(0.0, Number.EPSILON);
            expect(roll).to.approximately(0.42, Number.EPSILON);
        });

        it('decompose full rotation', () => {
            const matrix = matrixEulerEcef4(0.15, -1.3, 0.42);
            const [yaw, pitch, roll] = decomposeMatrixEulerEcef4(matrix);
            expect(yaw).to.approximately(0.15, Number.EPSILON);
            expect(pitch).to.approximately(-1.3, Number.EPSILON);
            expect(roll).to.approximately(0.42, Number.EPSILON);
        });
    });
});
