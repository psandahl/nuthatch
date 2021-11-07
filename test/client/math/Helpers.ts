import * as Three from 'three';

import {
    aspectRatioFromFov,
    ndcToUv,
    uvToNdc,
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

    describe('uvToNdc', () => {
        it('three points', () => {
            const mid = uvToNdc(new Three.Vector2(0.5, 0.5));
            expect(mid.x, 'mid.x').to.be.closeTo(0.0, Number.EPSILON);
            expect(mid.y, 'mid.y').to.be.closeTo(0.0, Number.EPSILON);

            const ll = uvToNdc(new Three.Vector2(0.0, 0.0));
            expect(ll.x, 'll.x').to.be.closeTo(-1.0, Number.EPSILON);
            expect(ll.y, 'll.y').to.be.closeTo(-1.0, Number.EPSILON);

            const ur = uvToNdc(new Three.Vector2(1.0, 1.0));
            expect(ur.x, 'ur.x').to.be.closeTo(1.0, Number.EPSILON);
            expect(ur.y, 'ur.y').to.be.closeTo(1.0, Number.EPSILON);
        });
    });

    describe('ndcToUv', () => {
        it('three points', () => {
            const mid = ndcToUv(new Three.Vector2(0.0, 0.0));
            expect(mid.x, 'mid.x').to.be.closeTo(0.5, Number.EPSILON);
            expect(mid.y, 'mid.y').to.be.closeTo(0.5, Number.EPSILON);

            const ll = ndcToUv(new Three.Vector2(-1.0, -1.0));
            expect(ll.x, 'll.x').to.be.closeTo(0.0, Number.EPSILON);
            expect(ll.y, 'll.y').to.be.closeTo(0.0, Number.EPSILON);

            const ur = ndcToUv(new Three.Vector2(1.0, 1.0));
            expect(ur.x, 'ur.x').to.be.closeTo(1.0, Number.EPSILON);
            expect(ur.y, 'ur.y').to.be.closeTo(1.0, Number.EPSILON);
        });
    });
});
