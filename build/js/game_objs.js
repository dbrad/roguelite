var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var GAMEINFO;
(function (GAMEINFO) {
    GAMEINFO.TILESIZE = 16;
    GAMEINFO.GAME_PIXEL_WIDTH = 800;
    GAMEINFO.GAME_PIXEL_HEIGHT = 448;
    GAMEINFO.GAME_TILE_WIDTH = GAMEINFO.GAME_PIXEL_WIDTH / GAMEINFO.TILESIZE;
    GAMEINFO.GAME_TILE_HEIGHT = GAMEINFO.GAME_PIXEL_HEIGHT / GAMEINFO.TILESIZE;
    GAMEINFO.GAMESCREEN_TILE_WIDTH = 40;
    GAMEINFO.GAMESCREEN_TILE_HEIGHT = 22;
    GAMEINFO.SIDEBAR_TILE_WIDTH = GAMEINFO.GAME_TILE_WIDTH - GAMEINFO.GAMESCREEN_TILE_WIDTH;
    GAMEINFO.SIDEBAR_TILE_HEIGHT = GAMEINFO.GAME_TILE_HEIGHT;
    GAMEINFO.TEXTLOG_TILE_WIDTH = GAMEINFO.GAME_TILE_WIDTH - GAMEINFO.SIDEBAR_TILE_WIDTH;
    GAMEINFO.TEXTLOG_TILE_HEIGHT = GAMEINFO.GAME_TILE_HEIGHT - GAMEINFO.GAMESCREEN_TILE_HEIGHT;
})(GAMEINFO || (GAMEINFO = {}));
var TileSet = (function () {
    function TileSet() {
    }
    return TileSet;
}());
var Entity = (function () {
    function Entity() {
        this.components = {};
    }
    Entity.prototype.addComponent = function (component) {
        this.components[component.name] = component;
        this[component.name] = component;
    };
    return Entity;
}());
var Component = (function () {
    function Component(name) {
        this.name = name;
    }
    return Component;
}());
var IsPlayerCom = (function (_super) {
    __extends(IsPlayerCom, _super);
    function IsPlayerCom() {
        _super.call(this, "isPlayer");
        this.value = true;
    }
    return IsPlayerCom;
}(Component));
var Item = (function () {
    function Item() {
    }
    return Item;
}());
var Cell = (function () {
    function Cell(tileID, itemIDs, entityID) {
        if (tileID === void 0) { tileID = 0; }
        if (itemIDs === void 0) { itemIDs = []; }
        if (entityID === void 0) { entityID = null; }
        this.tileID = tileID;
        this.entityID = entityID;
        this.itemIDs = itemIDs;
        this.visable = true;
        this.discovered = true;
    }
    return Cell;
}());
var Camera = (function () {
    function Camera(width, height, xOffset, yOffset) {
        if (xOffset === void 0) { xOffset = 0; }
        if (yOffset === void 0) { yOffset = 0; }
        this.width = width;
        this.height = height;
        this.xOffset = xOffset;
        this.yOffset = yOffset;
    }
    return Camera;
}());
var Level = (function () {
    function Level(width, height, camera) {
        this.redraw = true;
        this.cells = [];
        this.width = width;
        this.height = height;
        this.camera = camera;
        this.MiniMap = document.createElement("canvas");
        this.MiniMap.width = 160;
        this.MiniMap.height = 160;
    }
    Level.prototype.floodFill = function (x, y, target, fill) {
        var maxX = this.width - 1;
        var maxY = this.height - 1;
        var stack = [];
        var index = 0;
        stack[0] = [];
        stack[0][0] = x;
        stack[0][1] = y;
        this.cells[x][y].tileID = fill;
        while (index >= 0) {
            x = stack[index][0];
            y = stack[index][1];
            index--;
            if ((x > 0) && (this.cells[x - 1][y].tileID === target)) {
                this.cells[x - 1][y].tileID = fill;
                index++;
                if (!stack[index])
                    stack[index] = [];
                stack[index][0] = x - 1;
                stack[index][1] = y;
            }
            if ((x < maxX) && (this.cells[x + 1][y].tileID === target)) {
                this.cells[x + 1][y].tileID = fill;
                index++;
                if (!stack[index])
                    stack[index] = [];
                stack[index][0] = x + 1;
                stack[index][1] = y;
            }
            if ((y > 0) && (this.cells[x][y - 1].tileID === target)) {
                this.cells[x][y - 1].tileID = fill;
                index++;
                if (!stack[index])
                    stack[index] = [];
                stack[index][0] = x;
                stack[index][1] = y - 1;
            }
            if ((y < maxY) && (this.cells[x][y + 1].tileID === target)) {
                this.cells[x][y + 1].tileID = fill;
                index++;
                if (!stack[index])
                    stack[index] = [];
                stack[index][0] = x;
                stack[index][1] = y + 1;
            }
        }
    };
    Level.prototype.getWidth = function () {
        return this.width;
    };
    Level.prototype.getHeight = function () {
        return this.height;
    };
    Level.prototype.update = function () {
        if (Input.KB.isDown(Input.KB.KEY.LEFT)) {
            if (this.camera.xOffset <= 0)
                return;
            this.camera.xOffset -= 3;
            this.redraw = true;
        }
        else if (Input.KB.isDown(Input.KB.KEY.RIGHT)) {
            if (this.camera.xOffset + this.camera.width > this.width)
                return;
            this.camera.xOffset += 3;
            this.redraw = true;
        }
        if (Input.KB.isDown(Input.KB.KEY.UP)) {
            if (this.camera.yOffset <= 0)
                return;
            this.camera.yOffset -= 3;
            this.redraw = true;
        }
        else if (Input.KB.isDown(Input.KB.KEY.DOWN)) {
            if (this.camera.yOffset + this.camera.height > this.height)
                return;
            this.camera.yOffset += 3;
            this.redraw = true;
        }
    };
    Level.prototype.draw = function (ctx) {
        for (var tx = this.camera.xOffset, x = 0; tx < this.camera.xOffset + this.camera.width; tx++) {
            for (var ty = this.camera.yOffset, y = 0; ty < this.camera.yOffset + this.camera.height; ty++) {
                if (!this.cells[tx] || !this.cells[tx][ty]) {
                    ctx.fillStyle = "#333333";
                    ctx.fillRect(x * GAMEINFO.TILESIZE, y * GAMEINFO.TILESIZE, GAMEINFO.TILESIZE, GAMEINFO.TILESIZE);
                    y++;
                    continue;
                }
                var tCell = this.cells[tx][ty];
                if (!tCell.discovered) {
                    ctx.fillStyle = "black";
                    ctx.fillRect(x * GAMEINFO.TILESIZE, y * GAMEINFO.TILESIZE, GAMEINFO.TILESIZE, GAMEINFO.TILESIZE);
                }
                else if (!tCell.visable) {
                    ctx.fillStyle = "#bbb";
                    ctx.fillRect(x * GAMEINFO.TILESIZE, y * GAMEINFO.TILESIZE, GAMEINFO.TILESIZE, GAMEINFO.TILESIZE);
                }
                else {
                    switch (tCell.tileID) {
                        case 0:
                            ctx.fillStyle = "#333333";
                            break;
                        case 1:
                            ctx.fillStyle = "#AAA";
                            break;
                        case 2:
                            ctx.fillStyle = "#999999";
                            break;
                        default:
                            ctx.fillStyle = "#FFF";
                            break;
                    }
                    ctx.fillRect(x * GAMEINFO.TILESIZE, y * GAMEINFO.TILESIZE, GAMEINFO.TILESIZE, GAMEINFO.TILESIZE);
                }
                y++;
            }
            x++;
        }
    };
    Level.prototype.renderMiniMap = function () {
        var ctx = this.MiniMap.getContext("2d");
        for (var tx = 0, x = 0; tx < this.width; tx++) {
            for (var ty = 0, y = 0; ty < this.height; ty++) {
                if (!this.cells[tx]) {
                    ctx.fillStyle = "#333333";
                    ctx.fillRect(x, y, 1, 1);
                    y++;
                    continue;
                }
                if (!this.cells[tx][ty]) {
                    ctx.fillStyle = "#333333";
                    ctx.fillRect(x, y, 1, 1);
                    y++;
                    continue;
                }
                var tCell = this.cells[tx][ty];
                if (!tCell.discovered) {
                    ctx.fillStyle = "black";
                    ctx.fillRect(x, y, 1, 1);
                }
                else if (!tCell.visable) {
                    ctx.fillStyle = "#bbb";
                    ctx.fillRect(x, y, 1, 1);
                }
                else {
                    switch (tCell.tileID) {
                        case 0:
                            ctx.fillStyle = "#333333";
                            break;
                        case 1:
                            ctx.fillStyle = "#AAA";
                            break;
                        case 2:
                            ctx.fillStyle = "#999999";
                            break;
                        default:
                            ctx.fillStyle = "#FFF";
                            break;
                    }
                    ctx.fillRect(x, y, 1, 1);
                }
                y++;
            }
            x++;
        }
    };
    Level.prototype.drawMiniMap = function (ctx) {
        ctx.drawImage(this.MiniMap, GAMEINFO.GAME_PIXEL_WIDTH - this.width, GAMEINFO.GAME_PIXEL_HEIGHT - this.height, this.width, this.height, 0, 0, this.width, this.height);
        ctx.strokeStyle = "#FFF";
        ctx.lineWidth = 2;
        ctx.strokeRect(GAMEINFO.GAME_PIXEL_WIDTH - this.width + this.camera.xOffset, GAMEINFO.GAME_PIXEL_HEIGHT - this.height + this.camera.yOffset, this.camera.width, this.camera.height);
    };
    return Level;
}());
