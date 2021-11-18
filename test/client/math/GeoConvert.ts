import * as Three from 'three';

import { GeoConvert } from '../../../src/client/math/GeoConvert';

import { describe } from 'mocha';
import { expect } from 'chai';

describe('geo conversion between ecef and wgs84', () => {
    it('from ecef to wgs84', () => {
        const converter = new GeoConvert();
        const wgs84 = converter.ecefToWgs84(
            new Three.Vector3(3215642.022, 5234270.333, 1709824.411)
        );
        expect(wgs84.x).to.be.closeTo(58.435768, 0.00001);
        expect(wgs84.y).to.be.closeTo(15.653262, 0.00001);
        expect(wgs84.z).to.be.closeTo(40.0, 0.001);
    });

    it('from wgs84 to ecef', () => {
        const converter = new GeoConvert();
        const ecef = converter.wgs84ToEcef(
            new Three.Vector3(58.435768, 15.653262, 40.0)
        );
        expect(ecef.x).to.be.closeTo(3215642.022, 0.001);
        expect(ecef.y).to.be.closeTo(5234270.333, 0.001);
        expect(ecef.z).to.be.closeTo(1709824.411, 0.001);
    });
});
