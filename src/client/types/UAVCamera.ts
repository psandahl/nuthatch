export class UAVPosition {
    public x: number = 0.0;
    public y: number = 0.0;
    public z: number = 0.0;
}

export class UAVOrientation {
    public yaw: number = 0.0;
    public pitch: number = 0.0;
    public roll: number = 0.0;
}

export class UAVFieldOfView {
    public hfov: number = 0.0;
    public vfov: number = 0.0;
}

export class UAVLens {
    public k2: number = 0.0;
    public k3: number = 0.0;
    public k4: number = 0.0;
}

export class UAVCamera {
    public 'frame-id': number = 0.0;
    public position: UAVPosition = new UAVPosition();
    public platform: UAVOrientation = new UAVOrientation();
    public lever: UAVOrientation = new UAVOrientation();
    public fov: UAVFieldOfView = new UAVFieldOfView();
    public lens: UAVLens = new UAVLens();
}
