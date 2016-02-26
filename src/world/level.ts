/// <reference path="../system/input.ts"/>
/// <reference path="../system/camera.ts"/>
/// <reference path="../system/game_config.ts"/>

/// <reference path="../ecs/entity.ts"/>
/// <reference path="../ecs/components.ts"/>

/// <reference path="../util/utility.ts"/>
/// <reference path="../types/types.ts"/>

/// <reference path="./game_objs.ts"/>
/// <reference path="./cell.ts"/>

class Level {
    public redraw: boolean = true;
    public render_m: boolean = true;
    public render_mm: boolean = true;
    public cells: Cell[][];
    protected width: number;
    protected height: number;
    protected MiniMap: HTMLCanvasElement;
    protected renderCache: HTMLCanvasElement;
    public entrance: Point;
    protected exit: Point;

    public camera: Camera;

    protected tileSet: TileSet;
    protected ItemList: Item[];
    public EntityList: ECS.Entity[];

    constructor(width: number, height: number, camera: Camera) {
        this.cells = [];
        this.width = width;
        this.height = height;
        this.camera = camera;
        this.EntityList = [];

        this.MiniMap = document.createElement("canvas");
        this.MiniMap.width = width;
        this.MiniMap.height = height;
        (<Context2D>this.MiniMap.getContext("2d")).mozImageSmoothingEnabled = false;
        (<Context2D>this.MiniMap.getContext("2d")).imageSmoothingEnabled = false;

        this.renderCache = document.createElement("canvas");
        this.renderCache.width = (width * GAMEINFO.TILESIZE);
        this.renderCache.height = (height * GAMEINFO.TILESIZE);
        (<Context2D>this.renderCache.getContext("2d")).mozImageSmoothingEnabled = false;
        (<Context2D>this.renderCache.getContext("2d")).imageSmoothingEnabled = false;
    }

    public snapCameraToLevel() {
        if (this.camera.xOffset <= 0) {
            this.camera.xOffset = 0;
        }
        if (this.camera.xOffset + this.camera.width >= this.width) {
            this.camera.xOffset = (this.width - this.camera.width);
        }
        if (this.camera.yOffset <= 0) {
            this.camera.yOffset = 0;
        }
        if (this.camera.yOffset + this.camera.height >= this.height) {
            this.camera.yOffset = (this.height - this.camera.height);
        }
    }
    private partOfRoom(cell: Cell): boolean {
        return (cell.tileID === 2);
    }
    public floodDiscover(x: number, y: number) {
        let maxX: number = this.width - 1;
        let maxY: number = this.height - 1;
        let stack: Point[] = [];
        let index: number = 0;

        if (!stack[index]) {
            stack[index] = { x: 0, y: 0 };
        }
        stack[0].x = x;
        stack[0].y = y;
        this.cells[x][y].discovered = true;

        while (index >= 0) {
            if (!stack[index]) {
                stack[index] = { x: 0, y: 0 };
            }

            x = stack[index].x;
            y = stack[index].y;

            index--;

            if ((x > 0) && this.partOfRoom(this.cells[x - 1][y]) && !this.cells[x - 1][y].discovered) {
                this.cells[x - 1][y].discovered = true;
                index++;
                if (!stack[index]) {
                    stack[index] = { x: 0, y: 0 };
                }

                stack[index].x = x - 1;
                stack[index].y = y;
            }

            if ((x < maxX) && this.partOfRoom(this.cells[x + 1][y]) && !this.cells[x + 1][y].discovered) {
                this.cells[x + 1][y].discovered = true;
                index++;
                if (!stack[index]) {
                    stack[index] = { x: 0, y: 0 };
                }

                stack[index].x = x + 1;
                stack[index].y = y;
            }

            if ((y > 0) && this.partOfRoom(this.cells[x][y - 1]) && !this.cells[x][y - 1].discovered) {
                this.cells[x][y - 1].discovered = true;
                index++;
                if (!stack[index]) {
                    stack[index] = { x: 0, y: 0 };
                }

                stack[index].x = x;
                stack[index].y = y - 1;
            }

            if ((y < maxY) && this.partOfRoom(this.cells[x][y + 1]) && !this.cells[x][y + 1].discovered) {
                this.cells[x][y + 1].discovered = true;
                index++;
                if (!stack[index]) {
                    stack[index] = { x: 0, y: 0 };
                }

                stack[index].x = x;
                stack[index].y = y + 1;
            }
        }
        for (let x = 0; x < this.width; x++) {
            for (let y = 0; y < this.height; y++) {
                if (this.cells[x][y].tileID === 2 && this.cells[x][y].discovered) {
                    for (let ix = -1; ix <= 1; ix++) {
                        for (let iy = -1; iy <= 1; iy++) {
                            if (this.cells[x + ix] && this.cells[x + ix][y + iy] && !this.cells[x + ix][y + iy].discovered) {
                                this.cells[x + ix][y + iy].discovered = true;
                            }
                        }
                    }
                }
            }
        }
    }

    protected floodFill(x: number, y: number, target: number, fill: number) {
        let maxX: number = this.width - 1;
        let maxY: number = this.height - 1;
        let stack: Point[] = [];
        let index: number = 0;

        if (!stack[index]) {
            stack[index] = { x: 0, y: 0 };
        }
        stack[0].x = x;
        stack[0].y = y;
        this.cells[x][y].tileID = fill;

        while (index >= 0) {
            if (!stack[index]) {
                stack[index] = { x: 0, y: 0 };
            }
            x = stack[index].x;
            y = stack[index].y;

            index--;

            if ((x > 0) && (this.cells[x - 1][y].tileID === target)) {
                this.cells[x - 1][y].tileID = fill;
                index++;
                if (!stack[index]) {
                    stack[index] = { x: 0, y: 0 };
                }

                stack[index].x = x - 1;
                stack[index].y = y;
            }

            if ((x < maxX) && (this.cells[x + 1][y].tileID === target)) {
                this.cells[x + 1][y].tileID = fill;
                index++;
                if (!stack[index]) {
                    stack[index] = { x: 0, y: 0 };
                }

                stack[index].x = x + 1;
                stack[index].y = y;
            }

            if ((y > 0) && (this.cells[x][y - 1].tileID === target)) {
                this.cells[x][y - 1].tileID = fill;
                index++;
                if (!stack[index]) {
                    stack[index] = { x: 0, y: 0 };
                }

                stack[index].x = x;
                stack[index].y = y - 1;
            }

            if ((y < maxY) && (this.cells[x][y + 1].tileID === target)) {
                this.cells[x][y + 1].tileID = fill;
                index++;
                if (!stack[index]) {
                    stack[index] = { x: 0, y: 0 };
                }

                stack[index].x = x;
                stack[index].y = y + 1;
            }
        }
    }

    private camThresh: number = 12;
    private timer: number = 0;
    update(delta: number): void {
        this.timer += delta
        if (this.timer < 75)
            return;

        let step: number = 1;
        let player: ECS.Entity = this.EntityList[0];
        let playerPos: Point = player["pos"].value;

        if (Input.KB.isDown(Input.KB.KEY.NUM_1)) {
            player["torch"].value = 1;
            this.redraw = true;
        } else if (Input.KB.isDown(Input.KB.KEY.NUM_2)) {
            player["torch"].value = 2;
            this.redraw = true;
        } else if (Input.KB.isDown(Input.KB.KEY.NUM_3)) {
            player["torch"].value = 3;
            this.redraw = true;
        } else if (Input.KB.isDown(Input.KB.KEY.NUM_4)) {
            player["torch"].value = 4;
            this.redraw = true;
        } else if (Input.KB.isDown(Input.KB.KEY.NUM_5)) {
            player["torch"].value = 5;
            this.redraw = true;
        }

        if (Input.KB.isDown(Input.KB.KEY.LEFT)) {
            this.timer = 0;
            if (this.cells[playerPos.x - 1][playerPos.y].tileID !== 4) {
                playerPos.x--;
                if (playerPos.x < this.camera.xOffset + this.camThresh) {
                    this.camera.xOffset -= step;
                    if (this.camera.xOffset <= 0) {
                        this.camera.xOffset = 0;
                    }
                }
            }
            this.redraw = true;
        } else if (Input.KB.isDown(Input.KB.KEY.RIGHT)) {
            this.timer = 0;
            if (this.cells[playerPos.x + 1][playerPos.y].tileID !== 4) {
                playerPos.x++;
                if (playerPos.x >= this.camera.xOffset + this.camera.width - this.camThresh) {
                    this.camera.xOffset += step;
                    if (this.camera.xOffset + this.camera.width >= this.width) {
                        this.camera.xOffset = (this.width - this.camera.width);
                    }
                }
            }
            this.redraw = true;
        }

        if (Input.KB.isDown(Input.KB.KEY.UP)) {
            this.timer = 0;
            if (this.cells[playerPos.x][playerPos.y - 1].tileID !== 4) {
                playerPos.y--;
                if (playerPos.y < this.camera.yOffset + (this.camThresh - 3)) {
                    this.camera.yOffset -= step;
                    if (this.camera.yOffset <= 0) {
                        this.camera.yOffset = 0;
                    }
                }
            }
            this.redraw = true;
        } else if (Input.KB.isDown(Input.KB.KEY.DOWN)) {
            this.timer = 0;
            if (this.cells[playerPos.x][playerPos.y + 1].tileID !== 4) {
                playerPos.y++;
                if (playerPos.y >= this.camera.yOffset + this.camera.height - (this.camThresh - 3)) {
                    this.camera.yOffset += step;
                    if (this.camera.yOffset + this.camera.height >= this.height) {
                        this.camera.yOffset = (this.height - this.camera.height);
                    }
                }
            }
            this.redraw = true;
        }

        if (!this.cells[playerPos.x][playerPos.y].discovered) {
            this.floodDiscover(playerPos.x, playerPos.y);
            this.render_m = this.render_mm = true;
        }
    }
    getTempColor(tileID: number): string {
        let result: string = "ff00ff";
        switch (tileID) {
            case 0: // Void / Unused
                result = "#111111";
                break;
            case 1: // Currently Unused
                result = "#aaaaaa";
                break;
            case 2: // Floor
                result = "#222222";
                break;
            case 3: // Door
                result = "#ffffff";
                break;
            case 4: // Wall
                result = "#999999";
                break;
            case 5: // Stairs Up
                result = "#00ff00";
                break;
            case 6: // Stairs Down
                result = "#0066FF";
                break;
            default: // bright default to catch it.
                result = "#ff00ff";
                break;
        }
        return result;
    }
    render(ctx: Context2D, tSize: number): void {
        for (let tx = 0, x = 0; tx < this.width; tx++) {
            for (let ty = 0, y = 0; ty < this.height; ty++) {
                let tCell: Cell = null;
                if (!this.cells[tx] || !this.cells[tx][ty]) {
                    ctx.fillStyle = "#000000"; // No cell at location
                } else {
                    tCell = this.cells[tx][ty];
                    if (!tCell.discovered) {
                        ctx.fillStyle = "#000000";
                    } else if (!tCell.visable) {
                        ctx.fillStyle = this.getTempColor(tCell.tileID); //"#222222";
                    } else {
                        ctx.fillStyle = this.getTempColor(tCell.tileID);
                    }
                }
                if (tCell && tCell.discovered && tSize === 16) {
                    ctx.drawImage(SpriteSheetCache.spriteSheet("tiles").sprites[this.cells[tx][ty].tileID],
                        0, 0,
                        16, 16,
                        x * 16, y * 16,
                        16, 16);
                } else {
                    ctx.fillRect(x * tSize, y * tSize, tSize, tSize);
                }
                y++;
            }
            x++;
        }
    }
    draw(ctx: Context2D): void {
        if (this.render_m) {
            this.render(<Context2D>this.renderCache.getContext("2d"), GAMEINFO.TILESIZE);
            this.render_m = false;
        }
        ctx.drawImage(
            this.renderCache,
            this.camera.xOffset * GAMEINFO.TILESIZE, this.camera.yOffset * GAMEINFO.TILESIZE,
            GAMEINFO.GAMESCREEN_TILE_WIDTH * GAMEINFO.TILESIZE, GAMEINFO.GAMESCREEN_TILE_HEIGHT * GAMEINFO.TILESIZE,
            0, 0,
            GAMEINFO.GAMESCREEN_TILE_WIDTH * GAMEINFO.TILESIZE, GAMEINFO.GAMESCREEN_TILE_HEIGHT * GAMEINFO.TILESIZE);
    }
    drawMiniMap(ctx: Context2D): void {
        if (this.render_mm) {
            this.render(<Context2D>this.MiniMap.getContext("2d"), 1);
            this.render_mm = false;
        }
        ctx.drawImage(this.MiniMap,
            0, 0,
            this.MiniMap.width, this.MiniMap.height,
            GAMEINFO.GAME_PIXEL_WIDTH - this.MiniMap.width, 0, // GAMEINFO.GAME_PIXEL_HEIGHT - this.MiniMap.height,
            this.MiniMap.width, this.MiniMap.height);

        ctx.strokeStyle = "#FFF";
        ctx.lineWidth = 2;
        ctx.strokeRect(
            GAMEINFO.GAME_PIXEL_WIDTH - this.width + this.camera.xOffset,
            // GAMEINFO.GAME_PIXEL_HEIGHT - this.height +
            this.camera.yOffset,
            this.camera.width, this.camera.height);
    }
    drawEntities(ctx: Context2D) {
        let player: ECS.Entity;
        let playerPos: Point;
        let dx: number, dy: number;

        for (let e of this.EntityList) {
            if (e["player"]) {
                player = e;
                playerPos = player["pos"].value;
            }
        }

        let VisionPts: Point[] = [];
        let visableCells: Cell[] = [];
        let torchStr = player["torch"].value; //3.0;
        for (let d = -torchStr; d <= torchStr; d += 1) {
            VisionPts[VisionPts.length] = new Point(d, -torchStr);
            VisionPts[VisionPts.length] = new Point(d, torchStr);
            VisionPts[VisionPts.length] = new Point(-torchStr, d);
            VisionPts[VisionPts.length] = new Point(torchStr, d);
        }
        let steps: number = 0, incX: number = 0, incY: number = 0;
        ctx.globalAlpha = 0.1;
        ctx.fillStyle = "#FFFFFF";
        let px: number = round((playerPos.x + 0.5) * GAMEINFO.TILESIZE, 1),
            py: number = round((playerPos.y + 0.5) * GAMEINFO.TILESIZE, 1);
        for (let pt of VisionPts) {
            let vx: number = px, vy: number = py;

            dx = round((pt.x) * GAMEINFO.TILESIZE, 1);
            dy = round((pt.y) * GAMEINFO.TILESIZE, 1);

            if (Math.abs(dx) > Math.abs(dy)) {
                steps = Math.abs(dx);
            } else {
                steps = Math.abs(dy);
            }

            incX = round(dx / steps, 1);
            incY = round(dy / steps, 1);

            let tx: number = vx, ty: number = vy;
            for (let v = 0; v < steps; v++) {
                vx = round((vx + incX), 1);
                vy = round((vy + incY), 1);
                // if (incY > 0) { // looking down
                //
                // } else if (incY === 0) { // looking straight right or left
                //     ty = Math.floor(vy / GAMEINFO.TILESIZE);
                // } else { // looking up
                //     ty = Math.floor(vy / GAMEINFO.TILESIZE);
                // }
                //
                // if (incX > 0) { // looking right
                //     tx = Math.floor(vx / GAMEINFO.TILESIZE);
                // } else if (incX === 0) { // looking straight up or down
                //     tx = Math.floor(vx / GAMEINFO.TILESIZE);
                // } else { // looking left
                //
                // }
                ty = Math.floor(vy / GAMEINFO.TILESIZE);
                tx = Math.floor(vx / GAMEINFO.TILESIZE);

                if (this.cells[tx] && this.cells[tx][ty]) {
                    if (this.cells[tx][ty].tileID === 3 || this.cells[tx][ty].tileID === 4) {
                        break;
                    }
                    if (!this.cells[tx][ty].visable) {
                        this.cells[tx][ty].visable = true;
                        visableCells[visableCells.length] = this.cells[tx][ty];
                        ctx.fillRect(
                            (tx - this.camera.xOffset) * GAMEINFO.TILESIZE,
                            (ty - this.camera.yOffset) * GAMEINFO.TILESIZE,
                            GAMEINFO.TILESIZE, GAMEINFO.TILESIZE);
                    }
                }
            }
            // ctx.globalAlpha = 1.0;
            // ctx.strokeStyle = "#FFF";
            // ctx.lineWidth = 1;
            // ctx.beginPath();
            // ctx.moveTo(Math.round(px - (this.camera.xOffset * GAMEINFO.TILESIZE)), Math.round(py - (this.camera.yOffset * GAMEINFO.TILESIZE)));
            // ctx.lineTo(Math.round(vx - (this.camera.xOffset * GAMEINFO.TILESIZE)), Math.round(vy - (this.camera.yOffset * GAMEINFO.TILESIZE)));
            // ctx.stroke();
            // ctx.globalAlpha = 0.1;
        }
        ctx.globalAlpha = 1.0;

        // draw Entities to the screen if they are "in range", changing to a visability component.
        let index: number = 0;
        for (let e of this.EntityList) {
            dx = dy = 0;
            if (e["player"]) {
                index = 0;
                ctx.fillStyle = "#FF6600";
            } else {
                dx = player["pos"].value.x - e["pos"].value.x;
                dy = player["pos"].value.y - e["pos"].value.y;
                index = 1;
                ctx.fillStyle = "#FF0000";
            }
            let t: Point = e.components["pos"].value;
            if (e["player"] || this.cells[t.x][t.y].visable) {// (dx >= -ux && dx <= lx && dy >= -uy && dy <= ly)) { // || (e["visible"] && e["visible"].value === true)
                ctx.drawImage(SpriteSheetCache.spriteSheet("entities").sprites[index],
                    0, 0,
                    16, 16,
                    (t.x * GAMEINFO.TILESIZE) - (this.camera.xOffset * GAMEINFO.TILESIZE),
                    (t.y * GAMEINFO.TILESIZE) - (this.camera.yOffset * GAMEINFO.TILESIZE),
                    16, 16);
                ctx.fillRect(
                    t.x + (GAMEINFO.GAME_PIXEL_WIDTH - this.MiniMap.width),
                    t.y,
                    1, 1);
            }
        }
        ctx.globalAlpha = 1.0;
        for (let c of visableCells) {
            c.visable = false;
        }
        this.redraw = true;
    }
}
