import * as Three from 'three';
import proj4 from 'proj4';

/**
 * Class that convert between ECEF and WGS84.
 */
export class GeoConvert {
    constructor() {
        const ecef = '+proj=geocent +datum=WGS84 +units=m +no_defs';
        const wgs84 = '+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs';
        this.converter = proj4(ecef, wgs84);
    }

    /**
     * Convert from ECEF to WGS84.
     * @param position The position x, y, z
     * @returns The position lat, lon, h
     */
    public ecefToWgs84(position: Three.Vector3): Three.Vector3 {
        const [lon, lat, h] = this.converter.forward([
            position.x,
            position.y,
            position.z,
        ]);
        return new Three.Vector3(lat, lon, h);
    }

    /**
     * Convert from WGS84 to ECEF.
     * @param position The position lat, lon, h
     * @returns The position x, y, z
     */
    public wgs84ToEcef(position: Three.Vector3): Three.Vector3 {
        const [x, y, z] = this.converter.inverse([
            position.y,
            position.x,
            position.z,
        ]);
        return new Three.Vector3(x, y, z);
    }

    private converter: proj4.Converter;
}
