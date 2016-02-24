var Level = (function () {
    function Level(width, height, camera) {
        this.redraw = true;
        this.render_m = true;
        this.render_mm = true;
        this.camThresh = 12;
        this.timer = 0;
        this.cells = [];
        this.width = width;
        this.height = height;
        this.camera = camera;
        this.EntityList = [];
        this.MiniMap = document.createElement("canvas");
        this.MiniMap.width = width;
        this.MiniMap.height = height;
        this.MiniMap.getContext("2d").mozImageSmoothingEnabled = false;
        this.MiniMap.getContext("2d").imageSmoothingEnabled = false;
        this.renderCache = document.createElement("canvas");
        this.renderCache.width = (width * GAMEINFO.TILESIZE);
        this.renderCache.height = (height * GAMEINFO.TILESIZE);
        this.renderCache.getContext("2d").mozImageSmoothingEnabled = false;
        this.renderCache.getContext("2d").imageSmoothingEnabled = false;
    }
    Level.prototype.snapCameraToLevel = function () {
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
    };
    Level.prototype.partOfRoom = function (cell) {
        return (cell.tileID === 2);
    };
    Level.prototype.floodDiscover = function (x, y) {
        var maxX = this.width - 1;
        var maxY = this.height - 1;
        var stack = [];
        var index = 0;
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
    Level.prototype.floodFill = function (x, y, target, fill) {
        var maxX = this.width - 1;
        var maxY = this.height - 1;
        var stack = [];
        var index = 0;
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
    };
    Level.prototype.update = function (delta) {
        this.timer += delta;
        if (this.timer < 75)
            return;
        var step = 1;
        var player = this.EntityList[0];
        var playerPos = player["pos"].value;
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
        }
        else if (Input.KB.isDown(Input.KB.KEY.RIGHT)) {
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
        }
        else if (Input.KB.isDown(Input.KB.KEY.DOWN)) {
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
    };
    Level.prototype.getTempColor = function (tileID) {
        var result = "ff00ff";
        switch (tileID) {
            case 0:
                result = "#111111";
                break;
            case 1:
                result = "#aaaaaa";
                break;
            case 2:
                result = "#222222";
                break;
            case 3:
                result = "#ffffff";
                break;
            case 4:
                result = "#999999";
                break;
            case 5:
                result = "#00ff00";
                break;
            case 6:
                result = "#0066FF";
                break;
            default:
                result = "#ff00ff";
                break;
        }
        return result;
    };
    Level.prototype.render = function (ctx, tSize) {
        for (var tx = 0, x = 0; tx < this.width; tx++) {
            for (var ty = 0, y = 0; ty < this.height; ty++) {
                if (!this.cells[tx] || !this.cells[tx][ty]) {
                    ctx.fillStyle = "#111111";
                }
                else {
                    var tCell = this.cells[tx][ty];
                    if (!tCell.discovered) {
                        ctx.fillStyle = "#111111";
                    }
                    else if (!tCell.visable) {
                        ctx.fillStyle = "#222222";
                    }
                    else {
                        ctx.fillStyle = this.getTempColor(tCell.tileID);
                    }
                }
                ctx.fillRect(x * tSize, y * tSize, tSize, tSize);
                y++;
            }
            x++;
        }
    };
    Level.prototype.draw = function (ctx) {
        if (this.render_m) {
            this.render(this.renderCache.getContext("2d"), GAMEINFO.TILESIZE);
            this.render_m = false;
        }
        ctx.drawImage(this.renderCache, this.camera.xOffset * GAMEINFO.TILESIZE, this.camera.yOffset * GAMEINFO.TILESIZE, GAMEINFO.GAMESCREEN_TILE_WIDTH * GAMEINFO.TILESIZE, GAMEINFO.GAMESCREEN_TILE_HEIGHT * GAMEINFO.TILESIZE, 0, 0, GAMEINFO.GAMESCREEN_TILE_WIDTH * GAMEINFO.TILESIZE, GAMEINFO.GAMESCREEN_TILE_HEIGHT * GAMEINFO.TILESIZE);
    };
    Level.prototype.drawMiniMap = function (ctx) {
        if (this.render_mm) {
            this.render(this.MiniMap.getContext("2d"), 1);
            this.render_mm = false;
        }
        ctx.drawImage(this.MiniMap, 0, 0, this.MiniMap.width, this.MiniMap.height, GAMEINFO.GAME_PIXEL_WIDTH - this.MiniMap.width, 0, this.MiniMap.width, this.MiniMap.height);
        ctx.strokeStyle = "#FFF";
        ctx.lineWidth = 2;
        ctx.strokeRect(GAMEINFO.GAME_PIXEL_WIDTH - this.width + this.camera.xOffset, this.camera.yOffset, this.camera.width, this.camera.height);
    };
    Level.prototype.drawEntities = function (ctx) {
        var player;
        var playerPos;
        var dx, dy;
        for (var _i = 0, _a = this.EntityList; _i < _a.length; _i++) {
            var e = _a[_i];
            if (e["player"]) {
                player = e;
                playerPos = player["pos"].value;
            }
        }
        var ux, uy, lx, ly;
        var defaultDist = 4;
        ux = uy = lx = ly = defaultDist;
        for (var x0 = defaultDist; x0 >= 0; x0--) {
            for (var y0 = defaultDist; y0 >= 0; y0--) {
                if ((this.cells[playerPos.x + x0] && this.cells[playerPos.x + x0][playerPos.y + y0] && this.cells[playerPos.x + x0][playerPos.y + y0].tileID === 4)
                    || (this.cells[playerPos.x - x0] && this.cells[playerPos.x - x0][playerPos.y + y0] && this.cells[playerPos.x - x0][playerPos.y + y0].tileID === 4)
                    || (this.cells[playerPos.x + x0] && this.cells[playerPos.x + x0][playerPos.y - y0] && this.cells[playerPos.x + x0][playerPos.y - y0].tileID === 4)
                    || (this.cells[playerPos.x - x0] && this.cells[playerPos.x - x0][playerPos.y - y0] && this.cells[playerPos.x - x0][playerPos.y - y0].tileID === 4)) {
                    for (var torchDist = 1; torchDist < defaultDist; torchDist++) {
                        if (x0 <= torchDist && y0 <= torchDist && torchDist < ux) {
                            ux = uy = lx = ly = torchDist;
                            break;
                        }
                    }
                }
            }
        }
        ctx.globalAlpha = 0.1;
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect((player["pos"].value.x - this.camera.xOffset - ux) * GAMEINFO.TILESIZE, (player["pos"].value.y - this.camera.yOffset - uy) * GAMEINFO.TILESIZE, (1 + ux + lx) * GAMEINFO.TILESIZE, (1 + uy + ly) * GAMEINFO.TILESIZE);
        ctx.globalAlpha = 1.0;
        for (var _b = 0, _c = this.EntityList; _b < _c.length; _b++) {
            var e = _c[_b];
            dx = dy = 0;
            if (e["player"]) {
                ctx.fillStyle = "#FF6600";
            }
            else {
                dx = player["pos"].value.x - e["pos"].value.x;
                dy = player["pos"].value.y - e["pos"].value.y;
                ctx.fillStyle = "#FF0000";
            }
            var t = e.components["pos"].value;
            if (e["player"] || (dx >= -ux && dx <= lx && dy >= -uy && dy <= ly)) {
                ctx.fillRect((t.x * GAMEINFO.TILESIZE) - (this.camera.xOffset * GAMEINFO.TILESIZE), (t.y * GAMEINFO.TILESIZE) - (this.camera.yOffset * GAMEINFO.TILESIZE), GAMEINFO.TILESIZE, GAMEINFO.TILESIZE);
                ctx.fillRect(t.x + (GAMEINFO.GAME_PIXEL_WIDTH - this.MiniMap.width), t.y, 1, 1);
            }
        }
    };
    return Level;
}());
