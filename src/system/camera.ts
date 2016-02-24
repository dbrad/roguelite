class Camera {
    public width: number;
    public height: number;
    public xOffset: number;
    public yOffset: number;
    constructor(width: number, height: number, xOffset: number = 0, yOffset: number = 0) {
        this.width = width;
        this.height = height;
        this.xOffset = xOffset;
        this.yOffset = yOffset;
    }
}
