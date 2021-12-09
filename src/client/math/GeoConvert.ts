import * as Three from 'three';
import proj4 from 'proj4';

/**
 * Class that convert between ECEF and WGS84.
 */
export class GeoConvertWgs84 {
    /**
     *
     * @param heightOffset A height correction offset - added at wgs84 => ecef
     *                     and subtracted at ecef => wgs84.
     */
    constructor(heightOffset = 0) {
        const ecef = '+proj=geocent +datum=WGS84 +units=m +no_defs';
        const wgs84 = '+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs';
        this.converter = proj4(ecef, wgs84);
        this.heightOffset = heightOffset;
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
        return new Three.Vector3(lat, lon, h - this.heightOffset);
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
            position.z + this.heightOffset,
        ]);
        return new Three.Vector3(x, y, z);
    }

    private converter: proj4.Converter;
    private readonly heightOffset: number;
}

/**
 * Class that convert between ECEF and UTM.
 */
export class GeoConvertUtm {
    /**
     *
     * @param zone The UTM zone.
     * @param heightOffset A height correction offset - added at utm => ecef
     *                     and subtracted at ecef => utm.
     */
    constructor(zone: number, heightOffset = 0) {
        const ecef = '+proj=geocent +datum=WGS84 +units=m +no_defs';
        const utm = `+proj=utm +zone=${zone} +datum=WGS84 +units=m +no_defs`;

        this.converter = proj4(ecef, utm);
        this.heightOffset = heightOffset;
    }

    /**
     * Convert from ECEF to UTM.
     * @param position The position at x, y, z
     * @returns The position e, n, h
     */
    public ecefToUtm(position: Three.Vector3): Three.Vector3 {
        const [e, n, h] = this.converter.forward([
            position.x,
            position.y,
            position.z,
        ]);

        return new Three.Vector3(e, n, h - this.heightOffset);
    }

    /**
     * Convert from UTM to ECEF.
     * @param position The position e, n, h
     * @returns The position x, y, z
     */
    public utmToEcef(position: Three.Vector3): Three.Vector3 {
        const [x, y, z] = this.converter.inverse([
            position.x,
            position.y,
            position.z + this.heightOffset,
        ]);

        return new Three.Vector3(x, y, z);
    }

    private converter: proj4.Converter;
    private readonly heightOffset: number;
}
