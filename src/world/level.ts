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
    public visableCells: Point[];
    protected _width: number;
    protected _height: number;
    protected MiniMap: HTMLCanvasElement;
    protected renderCache: HTMLCanvasElement;
    public entrance: Point;
    protected exit: Point;

    public camera: Camera;

    protected tileSet: TileSet;
    protected ItemList: Items.Item[];
    public EntityList: ECS.Entity[];

    constructor(width: number, height: number, camera: Camera) {
        this.cells = [];
        this.visableCells = [];
        this._width = width;
        this._height = height;
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

    get height(): number {
        return this._height;
    }
    get width(): number {
        return this._width;
    }

    public snapCameraToLevel() {
        if (this.camera.xOffset <= 0) {
            this.camera.xOffset = 0;
        }
        if (this.camera.xOffset + this.camera.width >= this._width) {
            this.camera.xOffset = (this._width - this.camera.width);
        }
        if (this.camera.yOffset <= 0) {
            this.camera.yOffset = 0;
        }
        if (this.camera.yOffset + this.camera.height >= this._height) {
            this.camera.yOffset = (this._height - this.camera.height);
        }
    }

    public partOfRoom(cell: Cell): boolean {
        return (cell.tileID === 2);
    }
    public walkable(cell: Cell): boolean {
        return (cell.tileID === 2 || cell.tileID === 3 || cell.tileID === 5 || cell.tileID === 6);
    }
    public floodDiscover(x: number, y: number) {
        let maxX: number = this._width - 1;
        let maxY: number = this._height - 1;
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
        for (let x = 0; x < this._width; x++) {
            for (let y = 0; y < this._height; y++) {
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
        let maxX: number = this._width - 1;
        let maxY: number = this._height - 1;
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
        let player: ECS.Entity = this.EntityList.find(function(e: ECS.Entity, i: number, arr: ECS.Entity[]) { return (e["player"]); });

        let playerPos: Point = player["pos"].value

        let enemies: ECS.Entity[] = this.EntityList.filter(function(e, i, arr) { return (e["enemy"] && e["alive"] && e["alive"].value === true) });

        if (ECS.Systems.InputControl(player, this)) {
            for (let e of enemies) {
                ECS.Systems.AIControl(e, this, player);
                ECS.Systems.StubCombat(e, this, player);
            }
            ECS.Systems.Vision(player, this);

            this.redraw = true;
            this.timer = 0;
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
        for (let tx = 0, x = 0; tx < this._width; tx++) {
            for (let ty = 0, y = 0; ty < this._height; ty++) {
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
            GAMEINFO.GAME_PIXEL_WIDTH - this._width + this.camera.xOffset,
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

        ctx.globalAlpha = 0.05;
        for (let c of this.visableCells) {
            ctx.fillRect(
                (c.x - this.camera.xOffset) * GAMEINFO.TILESIZE,
                (c.y - this.camera.yOffset) * GAMEINFO.TILESIZE,
                GAMEINFO.TILESIZE, GAMEINFO.TILESIZE);
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
            if (e["player"] || (e["enemy"] && e["alive"] && e["alive"].value === true && this.cells[t.x][t.y].visable)) {
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
        this.redraw = true;
    }
}
