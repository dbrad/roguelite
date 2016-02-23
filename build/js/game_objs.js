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
    GAMEINFO.TEXTLOG_TILE_HEIGHT = 6;
    GAMEINFO.GAMESCREEN_TILE_WIDTH = GAMEINFO.GAME_TILE_WIDTH * .8;
    GAMEINFO.GAMESCREEN_TILE_HEIGHT = GAMEINFO.GAME_TILE_HEIGHT - GAMEINFO.TEXTLOG_TILE_HEIGHT;
    GAMEINFO.SIDEBAR_TILE_WIDTH = GAMEINFO.GAME_TILE_WIDTH - GAMEINFO.GAMESCREEN_TILE_WIDTH;
    GAMEINFO.SIDEBAR_TILE_HEIGHT = GAMEINFO.GAME_TILE_HEIGHT;
    GAMEINFO.TEXTLOG_TILE_WIDTH = GAMEINFO.GAME_TILE_WIDTH - GAMEINFO.SIDEBAR_TILE_WIDTH;
})(GAMEINFO || (GAMEINFO = {}));
var TileSet = (function () {
    function TileSet() {
    }
    return TileSet;
}());
var Entity = (function () {
    function Entity() {
        this.components = {};
        if (!Entity.autoID)
            Entity.autoID = 0;
        this.id = Entity.autoID++;
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
var TilePosCom = (function (_super) {
    __extends(TilePosCom, _super);
    function TilePosCom() {
        _super.call(this, "pos");
        this.x = 0;
        this.y = 0;
    }
    return TilePosCom;
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
        this.discovered = false;
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
        this.render_m = true;
        this.render_mm = true;
        this.camThresh = 12;
        this.cells = [];
        this.width = width;
        this.height = height;
        this.camera = camera;
        this.EntityList = [];
        this.MiniMap = document.createElement("canvas");
        this.MiniMap.width = width;
        this.MiniMap.height = height;
        this.renderCache = document.createElement("canvas");
        this.renderCache.width = (width * GAMEINFO.TILESIZE);
        this.renderCache.height = (height * GAMEINFO.TILESIZE);
    }
    Level.prototype.snapCamera = function () {
        if (this.camera.xOffset <= 0)
            this.camera.xOffset = 0;
        if (this.camera.xOffset + this.camera.width >= this.width)
            this.camera.xOffset = (this.width - this.camera.width);
        if (this.camera.yOffset <= 0)
            this.camera.yOffset = 0;
        if (this.camera.yOffset + this.camera.height >= this.height)
            this.camera.yOffset = (this.height - this.camera.height);
    };
    Level.prototype.partOfRoom = function (cell) {
        return (cell.tileID === 2);
    };
    Level.prototype.floodDiscover = function (x, y) {
        var maxX = this.width - 1;
        var maxY = this.height - 1;
        var stack = [];
        var index = 0;
        if (!stack[index])
            stack[index] = { x: 0, y: 0 };
        stack[0].x = x;
        stack[0].y = y;
        this.cells[x][y].discovered = true;
        while (index >= 0) {
            if (!stack[index])
                stack[index] = { x: 0, y: 0 };
            x = stack[index].x;
            y = stack[index].y;
            index--;
            if ((x > 0) && this.partOfRoom(this.cells[x - 1][y]) && !this.cells[x - 1][y].discovered) {
                this.cells[x - 1][y].discovered = true;
                index++;
                if (!stack[index])
                    stack[index] = { x: 0, y: 0 };
                stack[index].x = x - 1;
                stack[index].y = y;
            }
            if ((x < maxX) && this.partOfRoom(this.cells[x + 1][y]) && !this.cells[x + 1][y].discovered) {
                this.cells[x + 1][y].discovered = true;
                index++;
                if (!stack[index])
                    stack[index] = { x: 0, y: 0 };
                stack[index].x = x + 1;
                stack[index].y = y;
            }
            if ((y > 0) && this.partOfRoom(this.cells[x][y - 1]) && !this.cells[x][y - 1].discovered) {
                this.cells[x][y - 1].discovered = true;
                index++;
                if (!stack[index])
                    stack[index] = { x: 0, y: 0 };
                stack[index].x = x;
                stack[index].y = y - 1;
            }
            if ((y < maxY) && this.partOfRoom(this.cells[x][y + 1]) && !this.cells[x][y + 1].discovered) {
                this.cells[x][y + 1].discovered = true;
                index++;
                if (!stack[index])
                    stack[index] = { x: 0, y: 0 };
                stack[index].x = x;
                stack[index].y = y + 1;
            }
        }
        for (var x_1 = 0; x_1 < this.width; x_1++) {
            for (var y_1 = 0; y_1 < this.height; y_1++) {
                if (this.cells[x_1][y_1].tileID === 2 && this.cells[x_1][y_1].discovered) {
                    for (var ix = -1; ix <= 1; ix++) {
                        for (var iy = -1; iy <= 1; iy++) {
                            if (this.cells[x_1 + ix] && this.cells[x_1 + ix][y_1 + iy] && !this.cells[x_1 + ix][y_1 + iy].discovered) {
                                this.cells[x_1 + ix][y_1 + iy].discovered = true;
                            }
                        }
                    }
                }
            }
        }
    };
    Level.prototype.floodVision = function () {
    };
    Level.prototype.floodFill = function (x, y, target, fill) {
        var maxX = this.width - 1;
        var maxY = this.height - 1;
        var stack = [];
        var index = 0;
        if (!stack[index])
            stack[index] = { x: 0, y: 0 };
        stack[0].x = x;
        stack[0].y = y;
        this.cells[x][y].tileID = fill;
        while (index >= 0) {
            if (!stack[index])
                stack[index] = { x: 0, y: 0 };
            x = stack[index].x;
            y = stack[index].y;
            index--;
            if ((x > 0) && (this.cells[x - 1][y].tileID === target)) {
                this.cells[x - 1][y].tileID = fill;
                index++;
                if (!stack[index])
                    stack[index] = { x: 0, y: 0 };
                stack[index].x = x - 1;
                stack[index].y = y;
            }
            if ((x < maxX) && (this.cells[x + 1][y].tileID === target)) {
                this.cells[x + 1][y].tileID = fill;
                index++;
                if (!stack[index])
                    stack[index] = { x: 0, y: 0 };
                stack[index].x = x + 1;
                stack[index].y = y;
            }
            if ((y > 0) && (this.cells[x][y - 1].tileID === target)) {
                this.cells[x][y - 1].tileID = fill;
                index++;
                if (!stack[index])
                    stack[index] = { x: 0, y: 0 };
                stack[index].x = x;
                stack[index].y = y - 1;
            }
            if ((y < maxY) && (this.cells[x][y + 1].tileID === target)) {
                this.cells[x][y + 1].tileID = fill;
                index++;
                if (!stack[index])
                    stack[index] = { x: 0, y: 0 };
                stack[index].x = x;
                stack[index].y = y + 1;
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
        var step = 1;
        var player = this.EntityList[0];
        var playerPos = player["pos"];
        if (Input.KB.isDown(Input.KB.KEY.LEFT)) {
            if (this.cells[playerPos.x - 1][playerPos.y].tileID !== 4) {
                playerPos.x--;
                if (playerPos.x < this.camera.xOffset + this.camThresh) {
                    this.camera.xOffset -= step;
                    if (this.camera.xOffset <= 0)
                        this.camera.xOffset = 0;
                }
            }
            this.redraw = true;
        }
        else if (Input.KB.isDown(Input.KB.KEY.RIGHT)) {
            if (this.cells[playerPos.x + 1][playerPos.y].tileID !== 4) {
                playerPos.x++;
                if (playerPos.x >= this.camera.xOffset + this.camera.width - this.camThresh) {
                    this.camera.xOffset += step;
                    if (this.camera.xOffset + this.camera.width >= this.width)
                        this.camera.xOffset = (this.width - this.camera.width);
                }
            }
            this.redraw = true;
        }
        if (Input.KB.isDown(Input.KB.KEY.UP)) {
            if (this.cells[playerPos.x][playerPos.y - 1].tileID !== 4) {
                playerPos.y--;
                if (playerPos.y < this.camera.yOffset + (this.camThresh / 2)) {
                    this.camera.yOffset -= step;
                    if (this.camera.yOffset <= 0)
                        this.camera.yOffset = 0;
                }
            }
            this.redraw = true;
        }
        else if (Input.KB.isDown(Input.KB.KEY.DOWN)) {
            if (this.cells[playerPos.x][playerPos.y + 1].tileID !== 4) {
                playerPos.y++;
                if (playerPos.y >= this.camera.yOffset + this.camera.height - (this.camThresh / 2)) {
                    this.camera.yOffset += step;
                    if (this.camera.yOffset + this.camera.height >= this.height)
                        this.camera.yOffset = (this.height - this.camera.height);
                }
            }
            this.redraw = true;
        }
        if (!this.cells[playerPos.x][playerPos.y].discovered) {
            this.floodDiscover(playerPos.x, playerPos.y);
            this.render_m = this.render_mm = true;
        }
    };
    Level.prototype.render = function () {
        var ctx = this.renderCache.getContext("2d");
        for (var tx = 0, x = 0; tx < this.width; tx++) {
            for (var ty = 0, y = 0; ty < this.height; ty++) {
                if (!this.cells[tx] || !this.cells[tx][ty]) {
                    ctx.fillStyle = "#000";
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
                    ctx.fillStyle = "#222";
                    ctx.fillRect(x * GAMEINFO.TILESIZE, y * GAMEINFO.TILESIZE, GAMEINFO.TILESIZE, GAMEINFO.TILESIZE);
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
                            ctx.fillStyle = "#999999";
                            break;
                        case 3:
                            ctx.fillStyle = "#FFF";
                            break;
                        case 4:
                            ctx.fillStyle = "#222";
                            break;
                        case 5:
                            ctx.fillStyle = "#0F0";
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
    Level.prototype.draw = function (ctx) {
        if (this.render_m) {
            this.render();
            this.render_m = false;
        }
        ctx.drawImage(this.renderCache, this.camera.xOffset * GAMEINFO.TILESIZE, this.camera.yOffset * GAMEINFO.TILESIZE, GAMEINFO.GAMESCREEN_TILE_WIDTH * GAMEINFO.TILESIZE, GAMEINFO.GAMESCREEN_TILE_HEIGHT * GAMEINFO.TILESIZE, 0, 0, GAMEINFO.GAMESCREEN_TILE_WIDTH * GAMEINFO.TILESIZE, GAMEINFO.GAMESCREEN_TILE_HEIGHT * GAMEINFO.TILESIZE);
        ctx.fillText("Camera x: " + this.camera.xOffset * GAMEINFO.TILESIZE, 10, 12);
        ctx.fillText("Camera y: " + this.camera.yOffset * GAMEINFO.TILESIZE, 10, 24);
    };
    Level.prototype.renderMiniMap = function () {
        var ctx = this.MiniMap.getContext("2d");
        for (var tx = 0, x = 0; tx < this.width; tx++) {
            for (var ty = 0, y = 0; ty < this.height; ty++) {
                if (!this.cells[tx] || !this.cells[tx][ty]) {
                    ctx.fillStyle = "#000";
                    ctx.fillRect(x, y, 1, 1);
                    y++;
                    continue;
                }
                var tCell = this.cells[tx][ty];
                if (!tCell.discovered) {
                    ctx.fillStyle = "#000";
                    ctx.fillRect(x, y, 1, 1);
                }
                else if (!tCell.visable) {
                    ctx.fillStyle = "#222";
                    ctx.fillRect(x, y, 1, 1);
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
                            ctx.fillStyle = "#999999";
                            break;
                        case 3:
                            ctx.fillStyle = "#FFF";
                            break;
                        case 4:
                            ctx.fillStyle = "#222";
                            break;
                        case 5:
                            ctx.fillStyle = "#0F0";
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
        if (this.render_mm) {
            this.renderMiniMap();
            this.render_mm = false;
        }
        ctx.drawImage(this.MiniMap, 0, 0, this.MiniMap.width, this.MiniMap.height, GAMEINFO.GAME_PIXEL_WIDTH - this.MiniMap.width, GAMEINFO.GAME_PIXEL_HEIGHT - this.MiniMap.height, this.MiniMap.width, this.MiniMap.height);
        ctx.strokeStyle = "#FFF";
        ctx.lineWidth = 2;
        ctx.strokeRect(GAMEINFO.GAME_PIXEL_WIDTH - this.width + this.camera.xOffset, GAMEINFO.GAME_PIXEL_HEIGHT - this.height + this.camera.yOffset, this.camera.width, this.camera.height);
    };
    Level.prototype.drawEntities = function (ctx) {
        ctx.fillStyle = "#F00";
        for (var _i = 0, _a = this.EntityList; _i < _a.length; _i++) {
            var e = _a[_i];
            var t = (e.components["pos"]);
            if ((t.x * GAMEINFO.TILESIZE) + GAMEINFO.TILESIZE > this.camera.xOffset * GAMEINFO.TILESIZE
                && (t.x * GAMEINFO.TILESIZE) < (this.camera.xOffset + this.camera.width) * GAMEINFO.TILESIZE
                && (t.y * GAMEINFO.TILESIZE) + GAMEINFO.TILESIZE > this.camera.yOffset * GAMEINFO.TILESIZE
                && (t.y * GAMEINFO.TILESIZE) < (this.camera.yOffset + this.camera.height) * GAMEINFO.TILESIZE) {
                ctx.fillRect((t.x * GAMEINFO.TILESIZE) - (this.camera.xOffset * GAMEINFO.TILESIZE), (t.y * GAMEINFO.TILESIZE) - (this.camera.yOffset * GAMEINFO.TILESIZE), GAMEINFO.TILESIZE, GAMEINFO.TILESIZE);
            }
        }
    };
    return Level;
}());
