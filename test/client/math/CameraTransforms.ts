import * as Three from 'three';

import {
    ndcToUv,
    pxToUv,
    undistortUv,
    uvToCameraRay,
    uvToWorldRay,
    uvToNdc,
    uvToPx,
    viewZToLogDepth,
    logDepthToInvViewZ,
    worldToCamera,
    cameraToUv,
    uvToWorldPosition,
} from '../../../src/client/math/CameraTransforms';
import { matrixProjection4 } from '../../../src/client/math/Matrix';
import { DrawingArea } from '../../../src/client/types/DrawingArea';

import { describe } from 'mocha';
import { expect } from 'chai';

describe('camera transforms tests', () => {
    describe('pxToUv', () => {
        it('five points - no offset', () => {
            const area: DrawingArea = [0, 0, 1024, 768];

            const mid = pxToUv(area, new Three.Vector2(511.5, 383.5));
            expect(mid.x, 'mid.x').to.be.closeTo(0.5, Number.EPSILON);
            expect(mid.y, 'mid.y').to.be.closeTo(0.5, Number.EPSILON);

            const ul = pxToUv(area, new Three.Vector2(0, 0));
            expect(ul.x, 'ul.x').to.be.closeTo(0.0, Number.EPSILON);
            expect(ul.y, 'ul.y').to.be.closeTo(1.0, Number.EPSILON);

            const ur = pxToUv(area, new Three.Vector2(1023, 0));
            expect(ur.x, 'ur.x').to.be.closeTo(1.0, Number.EPSILON);
            expect(ur.y, 'ur.y').to.be.closeTo(1.0, Number.EPSILON);

            const ll = pxToUv(area, new Three.Vector2(0, 767));
            expect(ll.x, 'll.x').to.be.closeTo(0.0, Number.EPSILON);
            expect(ll.y, 'll.y').to.be.closeTo(0.0, Number.EPSILON);

            const lr = pxToUv(area, new Three.Vector2(1023, 767));
            expect(lr.x, 'lr.x').to.be.closeTo(1.0, Number.EPSILON);
            expect(lr.y, 'lr.y').to.be.closeTo(0.0, Number.EPSILON);
        });

        it('five points - x offset', () => {
            const area: DrawingArea = [10, 0, 100 - 2 * 10, 100];

            const mid = pxToUv(area, new Three.Vector2(49.5, 49.5));
            expect(mid.x, 'mid.x').to.be.closeTo(0.5, Number.EPSILON);
            expect(mid.y, 'mid.y').to.be.closeTo(0.5, Number.EPSILON);

            const ul = pxToUv(area, new Three.Vector2(10, 0));
            expect(ul.x, 'ul.x').to.be.closeTo(0.0, Number.EPSILON);
            expect(ul.y, 'ul.y').to.be.closeTo(1.0, Number.EPSILON);

            const ur = pxToUv(area, new Three.Vector2(89, 0));
            expect(ur.x, 'ur.x').to.be.closeTo(1.0, Number.EPSILON);
            expect(ur.y, 'ur.y').to.be.closeTo(1.0, Number.EPSILON);

            const ll = pxToUv(area, new Three.Vector2(10, 99));
            expect(ll.x, 'll.x').to.be.closeTo(0.0, Number.EPSILON);
            expect(ll.y, 'll.y').to.be.closeTo(0.0, Number.EPSILON);

            const lr = pxToUv(area, new Three.Vector2(89, 99));
            expect(lr.x, 'lr.x').to.be.closeTo(1.0, Number.EPSILON);
            expect(lr.y, 'lr.y').to.be.closeTo(0.0, Number.EPSILON);
        });
    });

    describe('uvToPx', () => {
        it('five points - no offset', () => {
            const area: DrawingArea = [0, 0, 1024, 768];

            const mid = uvToPx(area, new Three.Vector2(0.5, 0.5));
            expect(mid.x, 'mid.x').to.be.closeTo(511.5, Number.EPSILON);
            expect(mid.y, 'mid.y').to.be.closeTo(383.5, Number.EPSILON);

            const ul = uvToPx(area, new Three.Vector2(0.0, 1.0));
            expect(ul.x, 'ul.x').to.be.closeTo(0.0, Number.EPSILON);
            expect(ul.y, 'ul.y').to.be.closeTo(0.0, Number.EPSILON);

            const ur = uvToPx(area, new Three.Vector2(1.0, 1.0));
            expect(ur.x, 'ur.x').to.be.closeTo(1023.0, Number.EPSILON);
            expect(ur.y, 'ur.y').to.be.closeTo(0.0, Number.EPSILON);

            const ll = uvToPx(area, new Three.Vector2(0.0, 0.0));
            expect(ll.x, 'll.x').to.be.closeTo(0.0, Number.EPSILON);
            expect(ll.y, 'll.y').to.be.closeTo(767.0, Number.EPSILON);

            const lr = uvToPx(area, new Three.Vector2(1.0, 0.0));
            expect(lr.x, 'lr.x').to.be.closeTo(1023.0, Number.EPSILON);
            expect(lr.y, 'lr.y').to.be.closeTo(767.0, Number.EPSILON);
        });

        it('five points - x offset', () => {
            const area: DrawingArea = [10, 0, 100 - 2 * 10, 100];

            const mid = uvToPx(area, new Three.Vector2(0.5, 0.5));
            expect(mid.x, 'mid.x').to.be.closeTo(49.5, Number.EPSILON);
            expect(mid.y, 'mid.y').to.be.closeTo(49.5, Number.EPSILON);

            const ul = uvToPx(area, new Three.Vector2(0.0, 1.0));
            expect(ul.x, 'ul.x').to.be.closeTo(10.0, Number.EPSILON);
            expect(ul.y, 'ul.y').to.be.closeTo(0.0, Number.EPSILON);

            const ur = uvToPx(area, new Three.Vector2(1.0, 1.0));
            expect(ur.x, 'ur.x').to.be.closeTo(89.0, Number.EPSILON);
            expect(ur.y, 'ur.y').to.be.closeTo(0.0, Number.EPSILON);

            const ll = uvToPx(area, new Three.Vector2(0.0, 0.0));
            expect(ll.x, 'll.x').to.be.closeTo(10.0, Number.EPSILON);
            expect(ll.y, 'll.y').to.be.closeTo(99.0, Number.EPSILON);

            const lr = uvToPx(area, new Three.Vector2(1.0, 0.0));
            expect(lr.x, 'lr.x').to.be.closeTo(89.0, Number.EPSILON);
            expect(lr.y, 'lr.y').to.be.closeTo(99.0, Number.EPSILON);
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

    describe('uvToCameraRay', () => {
        it('two points', () => {
            const hFov = 1.0;
            const vFov = 0.7;
            const inverseProjection = matrixProjection4(
                1.0,
                0.7,
                1,
                1000
            ).invert();

            const mid = uvToCameraRay(
                inverseProjection,
                new Three.Vector2(0.5, 0.5)
            );

            // Just check origin once.
            expect(mid.origin.x, 'mid.origin.x').to.be.closeTo(
                0.0,
                Number.EPSILON
            );
            expect(mid.origin.y, 'mid.origin.y').to.be.closeTo(
                0.0,
                Number.EPSILON
            );
            expect(mid.origin.z, 'mid.origin.z').to.be.closeTo(
                0.0,
                Number.EPSILON
            );

            expect(mid.direction.x, 'mid.direction.x').to.be.closeTo(
                0.0,
                Number.EPSILON
            );
            expect(mid.direction.y, 'mid.direction.y').to.be.closeTo(
                0.0,
                Number.EPSILON
            );
            expect(mid.direction.z, 'mid.direction.z').to.be.closeTo(
                -1.0,
                Number.EPSILON
            );

            const ur = uvToCameraRay(
                inverseProjection,
                new Three.Vector2(1.0, 1.0)
            );
            // This is what the direction should look like.
            const expectUr = new Three.Vector3(
                Math.tan(hFov / 2.0),
                Math.tan(vFov / 2.0),
                -1.0
            ).normalize();

            expect(ur.direction.x, 'ur.direction.x').to.be.closeTo(
                expectUr.x,
                Number.EPSILON
            );
            expect(ur.direction.y, 'ur.direction.y').to.be.closeTo(
                expectUr.y,
                Number.EPSILON
            );
            expect(ur.direction.z, 'ur.direction.z').to.be.closeTo(
                expectUr.z,
                Number.EPSILON
            );
        });
    });

    describe('uvToWorldRay', () => {
        it('mid point only', () => {
            const hFov = 1.0;
            const vFov = 0.7;
            const inverseProjection = matrixProjection4(
                1.0,
                0.7,
                1,
                1000
            ).invert();

            const worldMatrix = new Three.Matrix4().lookAt(
                new Three.Vector3(5, 0, 0),
                new Three.Vector3(),
                new Three.Vector3(0, 0, 1)
            );
            worldMatrix.setPosition(5.0, 0.0, 0.0);

            const mid = uvToWorldRay(
                inverseProjection,
                worldMatrix,
                new Three.Vector2(0.5, 0.5)
            );

            expect(mid.origin.x, 'mid.origin.x').to.be.closeTo(
                5.0,
                Number.EPSILON
            );
            expect(mid.origin.y, 'mid.origin.y').to.be.closeTo(
                0.0,
                Number.EPSILON
            );
            expect(mid.origin.z, 'mid.origin.z').to.be.closeTo(
                0.0,
                Number.EPSILON
            );

            expect(mid.direction.x, 'mid.direction.x').to.be.closeTo(
                -1.0,
                Number.EPSILON
            );
            expect(mid.direction.y, 'mid.direction.y').to.be.closeTo(
                0.0,
                Number.EPSILON
            );
            expect(mid.direction.z, 'mid.direction.z').to.be.closeTo(
                0.0,
                Number.EPSILON
            );
        });
    });

    describe('undistortUv', () => {
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

    describe('logarithmic depth', () => {
        it('shall be equal', () => {
            expect(100.0).to.be.closeTo(
                logDepthToInvViewZ(viewZToLogDepth(-100, 10000), 10000),
                Number.EPSILON
            );
        });
    });

    describe('reconstruct from depth', () => {
        it('shall reconstruct world coordinate', () => {
            const camera = new Three.PerspectiveCamera(
                50,
                1024 / 768,
                1.0,
                100000.0
            );
            camera.position.set(10, 20, 30);
            camera.up.set(0, 1, 0);
            camera.lookAt(0, 0, 0);
            camera.updateMatrixWorld();
            camera.updateProjectionMatrix();

            const world = new Three.Vector3(-1.18, 1.37, -5631.55);
            const cam = worldToCamera(camera.matrixWorldInverse, world);
            const uv = cameraToUv(camera.projectionMatrix, cam);

            const newWorld = uvToWorldPosition(
                camera.projectionMatrixInverse,
                camera.matrixWorld,
                cam.z,
                uv
            );

            expect(newWorld.x).to.be.closeTo(world.x, 0.000000000001);
            expect(newWorld.y).to.be.closeTo(world.y, 0.000000000001);
            expect(newWorld.z).to.be.closeTo(world.z, 0.000000000001);
        });
    });
});
