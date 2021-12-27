/**
 * A geodetic camera position - WGS84.
 * TODO: Change generation to lat, lon, h.
 */
export class Position {
    public x: number = 0.0;
    public y: number = 0.0;
    public z: number = 0.0;
}

/**
 * Camera orientation - all angles are degrees.
 */
export class Orientation {
    public yaw: number = 0.0;
    public pitch: number = 0.0;
    public roll: number = 0.0;
}

/**
 * Camera field of view - all angles are degrees.
 */
export class FieldOfView {
    public hfov: number = 0.0;
    public vfov: number = 0.0;
}

/**
 * Camera radial distortion.
 */
export class Lens {
    public k2: number = 0.0;
    public k3: number = 0.0;
    public k4: number = 0.0;
}

/**
 * A tracking camera.
 */
export class Camera {
    public 'frame-id': number = 0.0;
    public position: Position = new Position();
    public platform: Orientation = new Orientation();
    public lever: Orientation = new Orientation();
    public fov: FieldOfView = new FieldOfView();
    public lens: Lens = new Lens();
}
