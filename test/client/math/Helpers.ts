import { aspectRatioFromFov } from '../../../src/client/math/Helpers';

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
});
