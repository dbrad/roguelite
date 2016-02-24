interface Context2D extends CanvasRenderingContext2D {
    mozImageSmoothingEnabled?: boolean;
    imageSmoothingEnabled?: boolean;
    webkitImageSmoothingEnabled?: boolean;
}

interface ImageArray {
    [index: string]: HTMLImageElement;
}

interface StringArray {
    [index: string]: string;
}

class Point {
    x: number;
    y: number;
    constructor(x: number = 0, y: number = 0) {
        this.x = x;
        this.y = y;
    }
}

class Dimension {
    w: number;
    h: number;
    constructor(w: number = 0, h: number = 0) {
        this.w = w;
        this.h = h;
    }
}
