import * as Three from 'three';

import { GeoConvert } from '../../../src/client/math/GeoConvert';

import { describe } from 'mocha';
import { expect } from 'chai';

describe('geo conversion between ecef and wgs84', () => {
    it('from ecef to wgs84', () => {
        const converter = new GeoConvert();
        const wgs84 = converter.ecefToWgs84(
            new Three.Vector3(-2206719.103843, -4878960.298373, 3459402.703715)
        );
        expect(wgs84.x).to.be.closeTo(33.03956, 0.00001);
        expect(wgs84.y).to.be.closeTo(-114.336902, 0.00001);
        expect(wgs84.z).to.be.closeTo(3237.725, 0.001);
    });

    it('from wgs84 to ecef', () => {
        const converter = new GeoConvert();
        const ecef = converter.wgs84ToEcef(
            new Three.Vector3(33.03956, -114.336902, 3237.725)
        );
        expect(ecef.x).to.be.closeTo(-2206719.103843, 0.1);
        expect(ecef.y).to.be.closeTo(-4878960.298373, 0.1);
        expect(ecef.z).to.be.closeTo(3459402.703715, 0.1);
    });
});
