import * as Three from 'three';

import {
    ndcToUv,
    pxToUv,
    undistortUv,
    uvToNdc,
    uvToPx,
} from '../../../src/client/math/CameraTransforms';
import { matrixProjection4 } from '../../../src/client/math/Matrix';
import { Size } from '../../../src/client/types/Size';

import { describe } from 'mocha';
import { expect } from 'chai';

describe('camera transforms tests', () => {
    describe('pxToUv', () => {
        it('five points', () => {
            const size: Size = [1024, 768];

            const mid = pxToUv(size, new Three.Vector2(511.5, 383.5));
            expect(mid.x, 'mid.x').to.be.closeTo(0.5, Number.EPSILON);
            expect(mid.y, 'mid.y').to.be.closeTo(0.5, Number.EPSILON);

            const ul = pxToUv(size, new Three.Vector2(0, 0));
            expect(ul.x, 'ul.x').to.be.closeTo(0.0, Number.EPSILON);
            expect(ul.y, 'ul.y').to.be.closeTo(1.0, Number.EPSILON);

            const ur = pxToUv(size, new Three.Vector2(1023, 0));
            expect(ur.x, 'ur.x').to.be.closeTo(1.0, Number.EPSILON);
            expect(ur.y, 'ur.y').to.be.closeTo(1.0, Number.EPSILON);

            const ll = pxToUv(size, new Three.Vector2(0, 767));
            expect(ll.x, 'll.x').to.be.closeTo(0.0, Number.EPSILON);
            expect(ll.y, 'll.y').to.be.closeTo(0.0, Number.EPSILON);

            const lr = pxToUv(size, new Three.Vector2(1023, 767));
            expect(lr.x, 'lr.x').to.be.closeTo(1.0, Number.EPSILON);
            expect(lr.y, 'lr.y').to.be.closeTo(0.0, Number.EPSILON);
        });
    });

    describe('uvToPx', () => {
        it('five points', () => {
            const size: Size = [1024, 768];

            const mid = uvToPx(size, new Three.Vector2(0.5, 0.5));
            expect(mid.x, 'mid.x').to.be.closeTo(511.5, Number.EPSILON);
            expect(mid.y, 'mid.y').to.be.closeTo(383.5, Number.EPSILON);

            const ul = uvToPx(size, new Three.Vector2(0.0, 1.0));
            expect(ul.x, 'ul.x').to.be.closeTo(0.0, Number.EPSILON);
            expect(ul.y, 'ul.y').to.be.closeTo(0.0, Number.EPSILON);

            const ur = uvToPx(size, new Three.Vector2(1.0, 1.0));
            expect(ur.x, 'ur.x').to.be.closeTo(1023.0, Number.EPSILON);
            expect(ur.y, 'ur.y').to.be.closeTo(0.0, Number.EPSILON);

            const ll = uvToPx(size, new Three.Vector2(0.0, 0.0));
            expect(ll.x, 'll.x').to.be.closeTo(0.0, Number.EPSILON);
            expect(ll.y, 'll.y').to.be.closeTo(767.0, Number.EPSILON);

            const lr = uvToPx(size, new Three.Vector2(1.0, 0.0));
            expect(lr.x, 'lr.x').to.be.closeTo(1023.0, Number.EPSILON);
            expect(lr.y, 'lr.y').to.be.closeTo(767.0, Number.EPSILON);
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

    describe('undistortUv - just smoke tests', () => {
        const projection = matrixProjection4(1.0, 0.7, 1, 1000);
        const inverseProjection = projection.clone().invert();

        it('zero valued coeffients shall not change uv', () => {
            const coeff = new Three.Vector3();

            const mid = undistortUv(
                projection,
                inverseProjection,
                new Three.Vector2(0.5, 0.5),
                coeff
            );
            expect(mid.x, 'mid.x').to.be.closeTo(0.5, Number.EPSILON);
            expect(mid.y, 'mid.y').to.be.closeTo(0.5, Number.EPSILON);

            const ur = undistortUv(
                projection,
                inverseProjection,
                new Three.Vector2(1.0, 1.0),
                coeff
            );
            expect(ur.x, 'ur.x').to.be.closeTo(1.0, Number.EPSILON);
            expect(ur.y, 'ur.y').to.be.closeTo(1.0, Number.EPSILON);
        });

        it('positive coeff shall modify uv', () => {
            const coeff = new Three.Vector3(1.0, 0.0, 0.0);

            // Mid shall not be changed.
            const mid = undistortUv(
                projection,
                inverseProjection,
                new Three.Vector2(0.5, 0.5),
                coeff
            );
            expect(mid.x, 'mid.x').to.be.closeTo(0.5, Number.EPSILON);
            expect(mid.y, 'mid.y').to.be.closeTo(0.5, Number.EPSILON);

            const ur = undistortUv(
                projection,
                inverseProjection,
                new Three.Vector2(1.0, 1.0),
                coeff
            );
            expect(ur.x, 'ur.x').to.be.greaterThan(1.0);
            expect(ur.y, 'ur.y').to.be.greaterThan(1.0);
            expect(ur.x).to.be.closeTo(ur.y, Number.EPSILON);
        });

        it('negative coeff shall modify uv', () => {
            const coeff = new Three.Vector3(-1.0, 0.0, 0.0);

            // Mid shall not be changed.
            const mid = undistortUv(
                projection,
                inverseProjection,
                new Three.Vector2(0.5, 0.5),
                coeff
            );
            expect(mid.x, 'mid.x').to.be.closeTo(0.5, Number.EPSILON);
            expect(mid.y, 'mid.y').to.be.closeTo(0.5, Number.EPSILON);

            const ur = undistortUv(
                projection,
                inverseProjection,
                new Three.Vector2(1.0, 1.0),
                coeff
            );
            expect(ur.x, 'ur.x').to.be.lessThan(1.0);
            expect(ur.y, 'ur.y').to.be.lessThan(1.0);
            expect(ur.x).to.be.closeTo(ur.y, Number.EPSILON);
        });
    });
});
