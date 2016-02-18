var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var GAMEINFO;
(function (GAMEINFO) {
    GAMEINFO.GAMESCREEN_TILE_WIDTH = 80;
    GAMEINFO.GAMESCREEN_TILE_HEIGHT = 45;
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
            this.camera.xOffset += 1;
            this.redraw = true;
        }
        else if (Input.KB.isDown(Input.KB.KEY.RIGHT)) {
            this.camera.xOffset -= 1;
            this.redraw = true;
        }
        if (Input.KB.isDown(Input.KB.KEY.UP)) {
            this.camera.yOffset += 1;
            this.redraw = true;
        }
        else if (Input.KB.isDown(Input.KB.KEY.DOWN)) {
            this.camera.yOffset -= 1;
            this.redraw = true;
        }
    };
    Level.prototype.draw = function (ctx) {
        for (var tx = this.camera.xOffset, x = 0; tx < this.camera.xOffset + this.camera.width; tx++) {
            for (var ty = this.camera.yOffset, y = 0; ty < this.camera.yOffset + this.camera.height; ty++) {
                if (!this.cells[tx]) {
                    ctx.fillStyle = "#000";
                    ctx.fillRect(x * 8, y * 8, 8, 8);
                    y++;
                    continue;
                }
                if (!this.cells[tx][ty]) {
                    ctx.fillStyle = "#000";
                    ctx.fillRect(x * 8, y * 8, 8, 8);
                    y++;
                    continue;
                }
                var tCell = this.cells[tx][ty];
                if (!tCell.discovered) {
                    ctx.fillStyle = "black";
                    ctx.fillRect(x * 8, y * 8, 8, 8);
                }
                else if (!tCell.visable) {
                    ctx.fillStyle = "#bbb";
                    ctx.fillRect(x * 8, y * 8, 8, 8);
                }
                else {
                    switch (tCell.tileID) {
                        case 0:
                            ctx.fillStyle = "#000";
                            break;
                        case 1:
                            ctx.fillStyle = "#AAA";
                            break;
                        case 2:
                            ctx.fillStyle = "#0FF";
                            break;
                        default:
                            ctx.fillStyle = "#FFF";
                            break;
                    }
                    ctx.fillRect(x * 8, y * 8, 8, 8);
                }
                y++;
            }
            x++;
        }
    };
    return Level;
}());
