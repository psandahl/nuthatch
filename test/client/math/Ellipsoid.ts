import * as Three from 'three';

import {
    SemiMajorAxis,
    SemiMinorAxis,
    intersectEllipsoid,
    heightAboveEllipsoid,
} from '../../../src/client/math/Ellipsoid';

import { describe } from 'mocha';
import { expect } from 'chai';

describe('ellipsoid tests', () => {
    describe('intersect ellipsoid', () => {
        it('intersect from positive x axis', () => {
            const ray = new Three.Ray(
                new Three.Vector3(SemiMajorAxis + 1000, 0, 0),
                new Three.Vector3(-1, 0, 0)
            );
            const t = intersectEllipsoid(ray);

            expect(t).not.equal(undefined);
            expect(t).to.be.closeTo(1000.0, 0.00001);
        });

        it('intersect from positive y axis', () => {
            const ray = new Three.Ray(
                new Three.Vector3(0, SemiMajorAxis + 1000, 0),
                new Three.Vector3(0, -1, 0)
            );
            const t = intersectEllipsoid(ray);

            expect(t).not.equal(undefined);
            expect(t).to.be.closeTo(1000.0, 0.00001);
        });

        it('intersect from positive z axis', () => {
            const ray = new Three.Ray(
                new Three.Vector3(0, 0, SemiMinorAxis + 1000),
                new Three.Vector3(0, 0, -1)
            );
            const t = intersectEllipsoid(ray);

            expect(t).not.equal(undefined);
            expect(t).to.be.closeTo(1000.0, 0.00001);
        });

        it('not intersecting the ellipsoid', () => {
            const ray = new Three.Ray(
                new Three.Vector3(0, SemiMajorAxis + 1000, 0),
                new Three.Vector3(1, 0, 0)
            );
            const t = intersectEllipsoid(ray);

            expect(t).equal(undefined);
        });
    });

    describe('height above ellipsoid', () => {
        it('Height above the positive x axis', () => {
            expect(
                heightAboveEllipsoid(
                    new Three.Vector3(SemiMajorAxis + 1000.0, 0, 0)
                )
            ).to.be.closeTo(1000.0, 0.00001);
        });

        it('Height above the positive y axis', () => {
            expect(
                heightAboveEllipsoid(
                    new Three.Vector3(0, SemiMajorAxis + 1000.0, 0)
                )
            ).to.be.closeTo(1000.0, 0.00001);
        });

        it('Height above the positive z axis', () => {
            expect(
                heightAboveEllipsoid(
                    new Three.Vector3(0, 0, SemiMinorAxis + 1000.0)
                )
            ).to.be.closeTo(1000.0, 0.00001);
        });
    });
});
