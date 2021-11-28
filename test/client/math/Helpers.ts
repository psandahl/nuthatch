import * as Three from 'three';

import {
    aspectRatioFromFov,
    degToRad,
    radToDeg,
} from '../../../src/client/math/Helpers';

import { describe } from 'mocha';
import { expect } from 'chai';

describe('math helpers tests', () => {
    describe('aspectRatioFromFov', () => {
        it('simple example', () => {
            const width = 1280;
            const height = 720;
            const f = 1280;
            const aspectRatio = width / height;

            const hFov = Math.atan2(width / 2.0, f) * 2.0;
            const vFov = Math.atan2(height / 2.0, f) * 2.0;
            expect(aspectRatioFromFov(hFov, vFov)).to.be.closeTo(
                aspectRatio,
                Number.EPSILON
            );
        });
    });

    describe('angle conversion', () => {
        it('degToRad', () => {
            expect(degToRad(0)).to.be.closeTo(0.0, Number.EPSILON);
            expect(degToRad(90)).to.be.closeTo(Math.PI / 2.0, Number.EPSILON);
            expect(degToRad(180)).to.be.closeTo(Math.PI, Number.EPSILON);
            expect(degToRad(270)).to.be.closeTo(
                Math.PI + Math.PI / 2.0,
                Number.EPSILON
            );
        });

        it('radToDeg', () => {
            expect(radToDeg(0)).to.be.closeTo(0.0, Number.EPSILON);
            expect(radToDeg(Math.PI / 2.0)).to.be.closeTo(90, Number.EPSILON);
            expect(radToDeg(Math.PI)).to.be.closeTo(180, Number.EPSILON);
            expect(radToDeg(Math.PI + Math.PI / 2.0)).to.be.closeTo(
                270,
                Number.EPSILON
            );
        });
    });
});
