/// <reference path="../types/types.ts"/>

class SpriteSheet {
    private image: any;
    sprites: HTMLCanvasElement[] = [];

    name: string;
    gutter: number;
    offset: Point;
    subsheet: Dimension;
    tileSize: number;

    spritesPerRow: number;
    spritesPerCol: number;

    constructor(
        imageName: string, sheetName: string, tileSize: number, gutter: number = 0,
        subsheet: Dimension = new Dimension(0, 0), offset: Point = new Point(0, 0)) {

        this.name = sheetName;
        this.offset = offset;
        this.subsheet = subsheet;
        this.tileSize = tileSize;
        this.gutter = gutter;
        this.image = ImageCache.getTexture(imageName);
        this.storeSprites();
    }

    public reColourize(index: number, r?: number, g?: number, b?: number, a?: number): void {
        let spriteCtx = this.sprites[index].getContext("2d");
        let colourData: ImageData = spriteCtx.getImageData(0, 0, this.tileSize, this.tileSize);
        for (let i = 0; i < (this.tileSize * this.tileSize) * 4; i += 4) {
            colourData.data[i] = r || colourData.data[i];
            colourData.data[i + 1] = g || colourData.data[i + 1];
            colourData.data[i + 2] = b || colourData.data[i + 2];
            colourData.data[i + 3] = a || colourData.data[i + 3];
        }
        spriteCtx.putImageData(colourData, 0, 0);
    }

    private storeSprites(callback: any = null) {
        this.spritesPerRow = ((this.subsheet.w === 0 || this.subsheet.h === 0) ? (this.image.width / this.tileSize) : this.subsheet.w);
        this.spritesPerCol = ((this.subsheet.w === 0 || this.subsheet.h === 0) ? (this.image.height / this.tileSize) : this.subsheet.h);

        let sprite: HTMLCanvasElement;
        for (let y = 0; y < this.spritesPerCol; y++) {
            for (let x = 0; x < this.spritesPerRow; x++) {
                sprite = this.sprites[x + (y * this.spritesPerRow)] = document.createElement('canvas');
                sprite.width = this.tileSize;
                sprite.height = this.tileSize;
                sprite.getContext('2d').drawImage(this.image,
                    ((this.tileSize + this.gutter) * x) + this.offset.x,
                    ((this.tileSize + this.gutter) * y) + this.offset.y,
                    this.tileSize, this.tileSize, 0, 0, this.tileSize, this.tileSize);
            }
        }
    }
}
