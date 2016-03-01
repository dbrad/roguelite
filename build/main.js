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

var Input;
(function (Input) {
    var KB;
    (function (KB) {
        (function (KEY) {
            KEY[KEY["A"] = 65] = "A";
            KEY[KEY["D"] = 68] = "D";
            KEY[KEY["W"] = 87] = "W";
            KEY[KEY["S"] = 83] = "S";
            KEY[KEY["LEFT"] = 37] = "LEFT";
            KEY[KEY["RIGHT"] = 39] = "RIGHT";
            KEY[KEY["UP"] = 38] = "UP";
            KEY[KEY["DOWN"] = 40] = "DOWN";
            KEY[KEY["ENTER"] = 13] = "ENTER";
            KEY[KEY["SPACE"] = 32] = "SPACE";
            KEY[KEY["NUM_1"] = 49] = "NUM_1";
            KEY[KEY["NUM_2"] = 50] = "NUM_2";
            KEY[KEY["NUM_3"] = 51] = "NUM_3";
            KEY[KEY["NUM_4"] = 52] = "NUM_4";
            KEY[KEY["NUM_5"] = 53] = "NUM_5";
        })(KB.KEY || (KB.KEY = {}));
        var KEY = KB.KEY;
        var _isDown = [];
        var _isUp = [];
        var _wasDown = [];
        for (var i = 0; i < 256; i++) {
            _isUp[i] = true;
        }
        function isDown(keyCode) {
            return (_isDown[keyCode]);
        }
        KB.isDown = isDown;
        function wasDown(keyCode) {
            var result = _wasDown[keyCode];
            _wasDown[keyCode] = false;
            return (result);
        }
        KB.wasDown = wasDown;
        function keyDown(event) {
            var keyCode = event.which;
            _isDown[keyCode] = true;
            if (_isUp[keyCode]) {
                _wasDown[keyCode] = true;
            }
            _isUp[keyCode] = false;
        }
        KB.keyDown = keyDown;
        function keyUp(event) {
            var keyCode = event.which;
            _isDown[keyCode] = false;
            _isUp[keyCode] = true;
        }
        KB.keyUp = keyUp;
    })(KB = Input.KB || (Input.KB = {}));
})(Input || (Input = {}));

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

var Point = (function () {
    function Point(x, y) {
        if (x === void 0) { x = 0; }
        if (y === void 0) { y = 0; }
        this.x = x;
        this.y = y;
    }
    return Point;
}());
var Dimension = (function () {
    function Dimension(w, h) {
        if (w === void 0) { w = 0; }
        if (h === void 0) { h = 0; }
        this.w = w;
        this.h = h;
    }
    return Dimension;
}());

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
function shuffle(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;
    while (0 !== currentIndex) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }
    return array;
}
function round(num, places) {
    var pow10 = Math.pow(10, places);
    var result = num * pow10;
    result = Math.round(result);
    result /= pow10;
    return result;
}

var ImageCache;
(function (ImageCache) {
    var cache = {};
    function getTexture(name) {
        return cache[name];
    }
    ImageCache.getTexture = getTexture;
    var toLoad = {};
    var loadCount = 0;
    var Loader;
    (function (Loader) {
        function add(name, url) {
            toLoad[name] = url;
            loadCount++;
        }
        Loader.add = add;
        function load(callback) {
            var async = { counter: 0, loadCount: 0, callback: callback };
            var done = function (async) { if ((async.counter++) === async.loadCount) {
                async.callback();
            } };
            for (var img in toLoad) {
                cache[img] = new Image();
                cache[img].src = toLoad[img];
                cache[img].onload = done.bind(this, async);
                delete toLoad[img];
            }
            loadCount = 0;
        }
        Loader.load = load;
    })(Loader = ImageCache.Loader || (ImageCache.Loader = {}));
})(ImageCache || (ImageCache = {}));

var SpriteSheet = (function () {
    function SpriteSheet(imageName, sheetName, tileSize, gutter, subsheet, offset) {
        if (gutter === void 0) { gutter = 0; }
        if (subsheet === void 0) { subsheet = new Dimension(0, 0); }
        if (offset === void 0) { offset = new Point(0, 0); }
        this.sprites = [];
        this.name = sheetName;
        this.offset = offset;
        this.subsheet = subsheet;
        this.tileSize = tileSize;
        this.gutter = gutter;
        this.image = ImageCache.getTexture(imageName);
        this.storeSprites();
    }
    SpriteSheet.prototype.reColourize = function (index, r, g, b, a) {
        var spriteCtx = this.sprites[index].getContext("2d");
        var colourData = spriteCtx.getImageData(0, 0, this.tileSize, this.tileSize);
        for (var i = 0; i < (this.tileSize * this.tileSize) * 4; i += 4) {
            colourData.data[i] = r || colourData.data[i];
            colourData.data[i + 1] = g || colourData.data[i + 1];
            colourData.data[i + 2] = b || colourData.data[i + 2];
            colourData.data[i + 3] = a || colourData.data[i + 3];
        }
        spriteCtx.putImageData(colourData, 0, 0);
    };
    SpriteSheet.prototype.storeSprites = function (callback) {
        if (callback === void 0) { callback = null; }
        this.spritesPerRow = ((this.subsheet.w === 0 || this.subsheet.h === 0) ? (this.image.width / this.tileSize) : this.subsheet.w);
        this.spritesPerCol = ((this.subsheet.w === 0 || this.subsheet.h === 0) ? (this.image.height / this.tileSize) : this.subsheet.h);
        var sprite;
        for (var y = 0; y < this.spritesPerCol; y++) {
            for (var x = 0; x < this.spritesPerRow; x++) {
                sprite = this.sprites[x + (y * this.spritesPerRow)] = document.createElement('canvas');
                sprite.width = this.tileSize;
                sprite.height = this.tileSize;
                sprite.getContext('2d').drawImage(this.image, ((this.tileSize + this.gutter) * x) + this.offset.x, ((this.tileSize + this.gutter) * y) + this.offset.y, this.tileSize, this.tileSize, 0, 0, this.tileSize, this.tileSize);
            }
        }
    };
    return SpriteSheet;
}());

var SpriteSheetCache;
(function (SpriteSheetCache) {
    var sheets = {};
    function storeSheet(sheet) {
        sheets[sheet.name] = sheet;
    }
    SpriteSheetCache.storeSheet = storeSheet;
    function spriteSheet(name) {
        return sheets[name];
    }
    SpriteSheetCache.spriteSheet = spriteSheet;
})(SpriteSheetCache || (SpriteSheetCache = {}));

var AudioPool = (function () {
    function AudioPool(sound, maxSize) {
        if (maxSize === void 0) { maxSize = 1; }
        this.pool = [];
        this.index = 0;
        this.maxSize = maxSize;
        for (var i = 0; i < this.maxSize; i++) {
            this.pool[i] = new Audio(sound);
            this.pool[i].load();
        }
    }
    AudioPool.prototype.play = function () {
        if (this.pool[this.index].currentTime == 0 || this.pool[this.index].ended) {
            this.pool[this.index].play();
        }
        this.index = (this.index + 1) % this.maxSize;
    };
    return AudioPool;
}());

var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var ECS;
(function (ECS) {
    var Components;
    (function (Components) {
        var Component = (function () {
            function Component(name) {
                this.name = name;
            }
            return Component;
        }());
        Components.Component = Component;
        var IsPlayer = (function (_super) {
            __extends(IsPlayer, _super);
            function IsPlayer() {
                _super.call(this, "player");
                this.value = true;
            }
            return IsPlayer;
        }(Component));
        Components.IsPlayer = IsPlayer;
        var IsEnemy = (function (_super) {
            __extends(IsEnemy, _super);
            function IsEnemy() {
                _super.call(this, "enemy");
                this.value = true;
            }
            return IsEnemy;
        }(Component));
        Components.IsEnemy = IsEnemy;
        var TilePos = (function (_super) {
            __extends(TilePos, _super);
            function TilePos() {
                _super.call(this, "pos");
                this.value = new Point(0, 0);
            }
            return TilePos;
        }(Component));
        Components.TilePos = TilePos;
        var TorchStr = (function (_super) {
            __extends(TorchStr, _super);
            function TorchStr() {
                _super.call(this, "torch");
                this.value = 3;
            }
            return TorchStr;
        }(Component));
        Components.TorchStr = TorchStr;
    })(Components = ECS.Components || (ECS.Components = {}));
})(ECS || (ECS = {}));

var ECS;
(function (ECS) {
    var Entity = (function () {
        function Entity() {
            this.components = {};
            if (!Entity.autoID) {
                Entity.autoID = 0;
            }
            this.id = Entity.autoID++;
        }
        Entity.prototype.addComponent = function (component) {
            this.components[component.name] = component;
            this[component.name] = component;
        };
        return Entity;
    }());
    ECS.Entity = Entity;
})(ECS || (ECS = {}));

var ECS;
(function (ECS) {
    var camThresh = 12;
    var Systems;
    (function (Systems) {
        function InputControl(e, level) {
            var entityPosition = e["pos"].value;
            var movementTaken = false;
            if (Input.KB.wasDown(Input.KB.KEY.LEFT)) {
                if (level.cells[entityPosition.x - 1][entityPosition.y].tileID !== 4) {
                    entityPosition.x--;
                    if (entityPosition.x < level.camera.xOffset + camThresh) {
                        level.camera.xOffset--;
                        if (level.camera.xOffset <= 0) {
                            level.camera.xOffset = 0;
                        }
                    }
                }
                movementTaken = true;
            }
            else if (Input.KB.wasDown(Input.KB.KEY.RIGHT)) {
                if (level.cells[entityPosition.x + 1][entityPosition.y].tileID !== 4) {
                    entityPosition.x++;
                    if (entityPosition.x >= level.camera.xOffset + level.camera.width - camThresh) {
                        level.camera.xOffset++;
                        if (level.camera.xOffset + level.camera.width >= level.width) {
                            level.camera.xOffset = (level.width - level.camera.width);
                        }
                    }
                }
                movementTaken = true;
            }
            else if (Input.KB.wasDown(Input.KB.KEY.UP)) {
                if (level.cells[entityPosition.x][entityPosition.y - 1].tileID !== 4) {
                    entityPosition.y--;
                    if (entityPosition.y < level.camera.yOffset + (camThresh - 3)) {
                        level.camera.yOffset--;
                        if (level.camera.yOffset <= 0) {
                            level.camera.yOffset = 0;
                        }
                    }
                }
                movementTaken = true;
            }
            else if (Input.KB.wasDown(Input.KB.KEY.DOWN)) {
                if (level.cells[entityPosition.x][entityPosition.y + 1].tileID !== 4) {
                    entityPosition.y++;
                    if (entityPosition.y >= level.camera.yOffset + level.camera.height - (camThresh - 3)) {
                        level.camera.yOffset++;
                        if (level.camera.yOffset + level.camera.height >= level.height) {
                            level.camera.yOffset = (level.height - level.camera.height);
                        }
                    }
                }
                movementTaken = true;
            }
            return movementTaken;
        }
        Systems.InputControl = InputControl;
        function AIControl(e, level, player) {
        }
        Systems.AIControl = AIControl;
    })(Systems = ECS.Systems || (ECS.Systems = {}));
})(ECS || (ECS = {}));

var TileSet = (function () {
    function TileSet() {
    }
    return TileSet;
}());
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
        this.visable = false;
        this.discovered = false;
    }
    return Cell;
}());

var Level = (function () {
    function Level(width, height, camera) {
        this.redraw = true;
        this.render_m = true;
        this.render_mm = true;
        this.camThresh = 12;
        this.timer = 0;
        this.cells = [];
        this._width = width;
        this._height = height;
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
    Object.defineProperty(Level.prototype, "height", {
        get: function () {
            return this._height;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Level.prototype, "width", {
        get: function () {
            return this._width;
        },
        enumerable: true,
        configurable: true
    });
    Level.prototype.snapCameraToLevel = function () {
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
    };
    Level.prototype.partOfRoom = function (cell) {
        return (cell.tileID === 2);
    };
    Level.prototype.floodDiscover = function (x, y) {
        var maxX = this._width - 1;
        var maxY = this._height - 1;
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
        for (var x_1 = 0; x_1 < this._width; x_1++) {
            for (var y_1 = 0; y_1 < this._height; y_1++) {
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
        var maxX = this._width - 1;
        var maxY = this._height - 1;
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
        var player;
        for (var _i = 0, _a = this.EntityList; _i < _a.length; _i++) {
            var e = _a[_i];
            if (e["player"]) {
                player = e;
            }
        }
        var playerPos = player["pos"].value;
        if (ECS.Systems.InputControl(player, this)) {
            for (var _b = 0, _c = this.EntityList; _b < _c.length; _b++) {
                var e = _c[_b];
                if (e["enemy"]) {
                    ECS.Systems.AIControl(e, this, player);
                }
            }
            this.redraw = true;
            this.timer = 0;
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
        for (var tx = 0, x = 0; tx < this._width; tx++) {
            for (var ty = 0, y = 0; ty < this._height; ty++) {
                var tCell = null;
                if (!this.cells[tx] || !this.cells[tx][ty]) {
                    ctx.fillStyle = "#000000";
                }
                else {
                    tCell = this.cells[tx][ty];
                    if (!tCell.discovered) {
                        ctx.fillStyle = "#000000";
                    }
                    else if (!tCell.visable) {
                        ctx.fillStyle = this.getTempColor(tCell.tileID);
                    }
                    else {
                        ctx.fillStyle = this.getTempColor(tCell.tileID);
                    }
                }
                if (tCell && tCell.discovered && tSize === 16) {
                    ctx.drawImage(SpriteSheetCache.spriteSheet("tiles").sprites[this.cells[tx][ty].tileID], 0, 0, 16, 16, x * 16, y * 16, 16, 16);
                }
                else {
                    ctx.fillRect(x * tSize, y * tSize, tSize, tSize);
                }
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
        ctx.strokeRect(GAMEINFO.GAME_PIXEL_WIDTH - this._width + this.camera.xOffset, this.camera.yOffset, this.camera.width, this.camera.height);
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
        var VisionPts = [];
        var visableCells = [];
        var torchStr = player["torch"].value;
        for (var d = -torchStr; d <= torchStr; d += 1) {
            VisionPts[VisionPts.length] = new Point(d, -torchStr);
            VisionPts[VisionPts.length] = new Point(d, torchStr);
            VisionPts[VisionPts.length] = new Point(-torchStr, d);
            VisionPts[VisionPts.length] = new Point(torchStr, d);
        }
        var steps = 0, incX = 0, incY = 0;
        ctx.globalAlpha = 0.1;
        ctx.fillStyle = "#FFFFFF";
        var px = round((playerPos.x + 0.5) * GAMEINFO.TILESIZE, 2), py = round((playerPos.y + 0.5) * GAMEINFO.TILESIZE, 2);
        for (var _b = 0, VisionPts_1 = VisionPts; _b < VisionPts_1.length; _b++) {
            var pt = VisionPts_1[_b];
            var vx = px, vy = py;
            dx = round((pt.x) * GAMEINFO.TILESIZE, 2);
            dy = round((pt.y) * GAMEINFO.TILESIZE, 2);
            if (Math.abs(dx) > Math.abs(dy)) {
                steps = Math.abs(dx);
            }
            else {
                steps = Math.abs(dy);
            }
            incX = round(dx / steps, 2);
            incY = round(dy / steps, 2);
            if (incX < 0 && incY > 0) {
                vy -= 1;
            }
            else if (incX > 0 && incY < 0) {
                vx -= 1;
            }
            var tx = 0, ty = 0;
            for (var v = 0; v < steps; v++) {
                vx = round((vx + incX), 2);
                vy = round((vy + incY), 2);
                tx = Math.floor(vx / GAMEINFO.TILESIZE);
                ty = Math.floor(vy / GAMEINFO.TILESIZE);
                if (this.cells[tx] && this.cells[tx][ty]) {
                    if (this.cells[tx][ty].tileID === 3 || this.cells[tx][ty].tileID === 4) {
                        break;
                    }
                    if (!this.cells[tx][ty].visable) {
                        this.cells[tx][ty].visable = true;
                        visableCells[visableCells.length] = this.cells[tx][ty];
                        ctx.fillRect((tx - this.camera.xOffset) * GAMEINFO.TILESIZE, (ty - this.camera.yOffset) * GAMEINFO.TILESIZE, GAMEINFO.TILESIZE, GAMEINFO.TILESIZE);
                    }
                }
            }
        }
        ctx.globalAlpha = 1.0;
        var index = 0;
        for (var _c = 0, _d = this.EntityList; _c < _d.length; _c++) {
            var e = _d[_c];
            dx = dy = 0;
            if (e["player"]) {
                index = 0;
                ctx.fillStyle = "#FF6600";
            }
            else {
                dx = player["pos"].value.x - e["pos"].value.x;
                dy = player["pos"].value.y - e["pos"].value.y;
                index = 1;
                ctx.fillStyle = "#FF0000";
            }
            var t = e.components["pos"].value;
            if (e["player"] || this.cells[t.x][t.y].visable) {
                ctx.drawImage(SpriteSheetCache.spriteSheet("entities").sprites[index], 0, 0, 16, 16, (t.x * GAMEINFO.TILESIZE) - (this.camera.xOffset * GAMEINFO.TILESIZE), (t.y * GAMEINFO.TILESIZE) - (this.camera.yOffset * GAMEINFO.TILESIZE), 16, 16);
                ctx.fillRect(t.x + (GAMEINFO.GAME_PIXEL_WIDTH - this.MiniMap.width), t.y, 1, 1);
            }
        }
        ctx.globalAlpha = 1.0;
        for (var _e = 0, visableCells_1 = visableCells; _e < visableCells_1.length; _e++) {
            var c = visableCells_1[_e];
            c.visable = false;
        }
        this.redraw = true;
    };
    return Level;
}());

var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Cave = (function (_super) {
    __extends(Cave, _super);
    function Cave(width, height, camera) {
        _super.call(this, width, height, camera);
        for (var x = 0; x < this._width; x++) {
            for (var y = 0; y < this._height; y++) {
                if (this.cells[x] === undefined) {
                    this.cells[x] = [];
                }
                if ((Math.random() * 100) < 50 || (x === 0 || x === (this._width - 1) || y === 0 || y === (this._height - 1))) {
                    this.cells[x][y] = new Cell(0);
                }
                else {
                    this.cells[x][y] = new Cell(1);
                }
            }
        }
        for (var x = 5; x < this._width - 5; x++) {
            this.cells[x][(this._height / 2) - 1].tileID = 1;
            this.cells[x][(this._height / 2)].tileID = 1;
            this.cells[x][(this._height / 2) + 1].tileID = 1;
        }
        for (var y = 5; y < this._width - 5; y++) {
            this.cells[(this._height / 2) - 1][y].tileID = 1;
            this.cells[(this._height / 2)][y].tileID = 1;
            this.cells[(this._height / 2) + 1][y].tileID = 1;
        }
        this.cellularAutomata([5, 6, 7, 8], [4, 5, 6, 7, 8]);
        this.cellularAutomata([5, 6, 7, 8], [4, 5, 6, 7, 8]);
        this.cellularAutomata([5, 6, 7, 8], [4, 5, 6, 7, 8]);
        this.cellularAutomata([5, 6, 7, 8], [4, 5, 6, 7, 8]);
        this.cellularAutomata([5, 6, 7, 8], [4, 5, 6, 7, 8]);
        for (var x = 1; x < this._width - 1; x++) {
            for (var y = 1; y < this._height - 1; y++) {
                var tCell = this.cells[x][y];
                var liveN = this.getLiveNeighbors(x, y);
                if (tCell.tileID === 0 && liveN < 2) {
                    tCell.tileID = 1;
                }
                else if (tCell.tileID === 1 && liveN === 8) {
                    tCell.tileID = 0;
                }
            }
        }
        var mx = (this._width / 2);
        var my = (this._height / 2);
        while (this.cells[mx][my].tileID !== 1) {
            mx++;
        }
        this.floodFill(mx, my, 1, 2);
        for (var x = 1; x < this._width - 1; x++) {
            for (var y = 1; y < this._height - 1; y++) {
                if (this.cells[x][y].tileID === 1) {
                    this.cells[x][y].tileID = 0;
                }
            }
        }
    }
    Cave.prototype.getLiveNeighbors = function (x, y) {
        var count = 0;
        for (var nx = x - 1; nx <= x + 1; nx++) {
            if (nx < 0 || nx > this._width) {
                continue;
            }
            for (var ny = y - 1; ny <= y + 1; ny++) {
                if (ny < 0 || ny > this._height) {
                    continue;
                }
                if (!(nx === x && ny === y)) {
                    count += this.cells[nx][ny].tileID;
                }
            }
        }
        return 8 - count;
    };
    Cave.prototype.cellularAutomata = function (B, S) {
        for (var x = 1; x < this._width - 1; x++) {
            for (var y = 1; y < this._height - 1; y++) {
                var tCell = this.cells[x][y];
                var liveN = this.getLiveNeighbors(x, y);
                if (tCell.tileID === 1) {
                    for (var n in B) {
                        if (liveN === B[n]) {
                            tCell.tileID = 0;
                            break;
                        }
                    }
                }
                else {
                    tCell.tileID = 1;
                    for (var n in S) {
                        if (liveN === S[n]) {
                            tCell.tileID = 0;
                            break;
                        }
                    }
                }
            }
        }
    };
    return Cave;
}(Level));

var WALL;
(function (WALL) {
    WALL[WALL["N"] = 0] = "N";
    WALL[WALL["E"] = 1] = "E";
    WALL[WALL["S"] = 2] = "S";
    WALL[WALL["W"] = 3] = "W";
})(WALL || (WALL = {}));
;
var Room = (function () {
    function Room() {
        this.x = 0;
        this.y = 0;
        this.w = 0;
        this.h = 0;
        this.walls = [WALL.N, WALL.E, WALL.S, WALL.W];
        shuffle(this.walls);
    }
    Room.prototype.getRandomWall = function () {
        var randWall = this.walls.pop();
        var x, y;
        if (randWall === WALL.N) {
            x = this.x + Math.floor(this.w / 2);
            y = this.y - 1;
        }
        else if (randWall === WALL.S) {
            x = this.x + Math.floor(this.w / 2);
            y = this.y + this.h;
        }
        else if (randWall === WALL.W) {
            x = this.x - 1;
            y = this.y + Math.floor(this.h / 2);
        }
        else if (randWall === WALL.E) {
            x = this.x + this.w;
            y = this.y + Math.floor(this.h / 2);
        }
        return { x: x, y: y, w: randWall };
    };
    return Room;
}());

var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Dungeon = (function (_super) {
    __extends(Dungeon, _super);
    function Dungeon(width, height, camera) {
        _super.call(this, width, height, camera);
        this.rooms = [];
        for (var x = 0; x < this._width; x++) {
            for (var y = 0; y < this._height; y++) {
                if (this.cells[x] === undefined) {
                    this.cells[x] = [];
                }
                this.cells[x][y] = new Cell(0);
            }
        }
        this.generate(32);
    }
    Dungeon.prototype.scan = function (room, wall, adjustForDoor) {
        var result = true;
        var x = (wall === WALL.W) ? room.x - 1 : room.x;
        var y = (wall === WALL.N) ? room.y - 1 : room.y;
        var w = (adjustForDoor && (wall === WALL.W || wall === WALL.E)) ? room.w + 1 : room.w;
        var h = (adjustForDoor && (wall === WALL.N || wall === WALL.S)) ? room.h + 1 : room.h;
        w = (wall === WALL.N || wall === WALL.S) ? w + 1 : w;
        h = (wall === WALL.W || wall === WALL.E) ? h + 1 : h;
        if (adjustForDoor) {
            x = (wall === WALL.E) ? x - 1 : x;
            y = (wall === WALL.S) ? y - 1 : y;
        }
        if (wall === WALL.N || wall === WALL.S) {
            x -= 1;
        }
        if (wall === WALL.W || wall === WALL.E) {
            y -= 1;
        }
        for (var x0 = x; !(x0 > (x + w)) && result; x0++) {
            for (var y0 = y; !(y0 > (y + h)) && result; y0++) {
                result = result && (this.cells[x0] !== undefined)
                    && (this.cells[x0][y0] !== undefined)
                    && (this.cells[x0][y0].tileID === 0);
            }
        }
        return result;
    };
    Dungeon.prototype.addRoom = function (room) {
        for (var x0 = room.x; (x0 < room.x + room.w); x0++) {
            for (var y0 = room.y; (y0 < room.y + room.h); y0++) {
                this.cells[x0][y0].tileID = 2;
            }
        }
    };
    Dungeon.prototype.addTile = function (p, tid) {
        this.cells[p.x][p.y].tileID = tid;
    };
    Dungeon.prototype.makeRoom = function (p, feature, adjustForDoor) {
        if (p === void 0) { p = { x: -1, y: -1, w: -1 }; }
        if (feature === void 0) { feature = "R"; }
        if (adjustForDoor === void 0) { adjustForDoor = false; }
        var room = new Room();
        room.roomType = feature;
        if (feature === "R") {
            do {
                room.w = randomInt(5, this._width / 5);
                room.w = room.w % 2 === 0 ? room.w - 1 : room.w;
                room.h = randomInt(5, this._height / 5);
                room.h = room.h % 2 === 0 ? room.h - 1 : room.h;
            } while (room.w * room.h > (this._width * this._height) / 4);
        }
        else if (feature === "C") {
            room.w = (p.w === WALL.N || p.w === WALL.S) ? 3 : randomInt(5, 9);
            room.w = room.w % 2 === 0 ? room.w - 1 : room.w;
            room.h = (p.w === WALL.W || p.w === WALL.E) ? 3 : randomInt(5, 9);
            room.h = room.h % 2 === 0 ? room.h - 1 : room.h;
        }
        room.x = (p.w === WALL.N || p.w === WALL.S) ? p.x - Math.floor(room.w / 2) : p.x;
        room.x = (p.w === WALL.W) ? room.x - (room.w - 1) : room.x;
        room.y = (p.w === WALL.W || p.w === WALL.E) ? p.y - Math.floor(room.h / 2) : p.y;
        room.y = (p.w === WALL.N) ? room.y - (room.h - 1) : room.y;
        if (adjustForDoor) {
            switch (p.w) {
                case WALL.N:
                    room.y -= 1;
                    break;
                case WALL.S:
                    room.y += 1;
                    break;
                case WALL.W:
                    room.x -= 1;
                    break;
                case WALL.E:
                    room.x += 1;
                    break;
                default:
                    break;
            }
        }
        return room;
    };
    Dungeon.prototype.generate = function (rooms) {
        var gRooms = 0;
        var weight = 0;
        var roomStack = [];
        var currentFeature = "";
        var lastFeature = "R";
        var attempts = 0;
        var feature = randomInt(0, 100);
        var room = this.makeRoom();
        room.x = randomInt(1, Math.floor(this._width - room.w) - 1);
        room.y = randomInt(1, Math.floor(this._height - room.h) - 1);
        roomStack[roomStack.length] = room;
        this.addRoom(room);
        this.rooms.push(room);
        gRooms++;
        this.entrance = new Point(room.x + Math.floor(room.w / 2), room.y + Math.floor(room.h / 2));
        this.addTile(this.entrance, 5);
        var p;
        while (roomStack.length > 0 && gRooms < rooms) {
            if (feature > (65 + weight)) {
                currentFeature = "C";
            }
            else {
                currentFeature = "R";
            }
            do {
                if (attempts > 5 || attempts === 0) {
                    if (roomStack[roomStack.length - 1].walls.length === 0) {
                        roomStack.pop();
                    }
                    if (roomStack.length === 0) {
                        break;
                    }
                    p = roomStack[roomStack.length - 1].getRandomWall();
                    lastFeature = roomStack[roomStack.length - 1].roomType;
                }
                room = this.makeRoom(p, currentFeature, currentFeature !== lastFeature);
                attempts++;
            } while (!this.scan(room, p.w, currentFeature !== lastFeature));
            attempts = 0;
            if (roomStack.length === 0) {
                break;
            }
            if (currentFeature !== lastFeature) {
                this.addTile(p, 3);
            }
            roomStack[roomStack.length] = room;
            this.addRoom(room);
            if (currentFeature === "C") {
                weight += 10;
            }
            else {
                this.rooms.push(room);
                gRooms++;
                weight -= 10;
            }
            lastFeature = roomStack[roomStack.length - 1].roomType;
            currentFeature = "";
            feature = randomInt(0, 100);
        }
        var lastRoom = this.rooms[this.rooms.length - 1];
        this.addTile({ x: lastRoom.x + Math.floor(lastRoom.w / 2), y: lastRoom.y + Math.floor(lastRoom.h / 2) }, 6);
        for (var x = 0; x < this._width; x++) {
            for (var y = 0; y < this._height; y++) {
                if (this.cells[x][y].tileID === 2) {
                    for (var ix = -1; ix <= 1; ix++) {
                        for (var iy = -1; iy <= 1; iy++) {
                            if (this.cells[x + ix] && this.cells[x + ix][y + iy] && this.cells[x + ix][y + iy].tileID === 0) {
                                this.cells[x + ix][y + iy].tileID = 4;
                            }
                        }
                    }
                }
            }
        }
    };
    return Dungeon;
}(Level));

var Game = (function () {
    function Game(screen) {
        this.change = true;
        this.redraw = true;
        this.clearScreen = true;
        this.then = performance.now();
        this.timePaused = 0;
        this.deltaPaused = 0;
        console.log("Setting up screen");
        this.screen = screen;
        this.ctx = screen.getContext("2d");
        this.ctx.mozImageSmoothingEnabled = false;
        this.ctx.imageSmoothingEnabled = false;
        this.buffer = document.createElement("canvas");
        this.buffer.width = GAMEINFO.GAME_PIXEL_WIDTH;
        this.buffer.height = GAMEINFO.GAME_PIXEL_HEIGHT;
        this.bufferCtx = this.buffer.getContext("2d");
        this.bufferCtx.mozImageSmoothingEnabled = false;
        this.bufferCtx.imageSmoothingEnabled = false;
    }
    Game.prototype.init = function () {
        console.log("Initializing...");
        SpriteSheetCache.storeSheet(new SpriteSheet("sheet", "tiles", 16, 0, new Dimension(7, 1)));
        SpriteSheetCache.storeSheet(new SpriteSheet("sheet", "entities", 16, 0, new Dimension(2, 1), new Point(0, 16)));
        SpriteSheetCache.spriteSheet("entities").reColourize(0, 245, 200, 25);
        SpriteSheetCache.spriteSheet("entities").reColourize(1, 150, 150, 150);
        SpriteSheetCache.spriteSheet("tiles").reColourize(4, 75, 75, 75);
        SpriteSheetCache.spriteSheet("tiles").reColourize(3, 140, 100, 60);
        this.level = new Dungeon(160, 160, new Camera(GAMEINFO.GAMESCREEN_TILE_WIDTH, GAMEINFO.GAMESCREEN_TILE_HEIGHT));
        this.level.floodDiscover(this.level.entrance.x, this.level.entrance.y);
        this.level.camera.xOffset = this.level.entrance.x - (this.level.camera.width / 2);
        this.level.camera.yOffset = this.level.entrance.y - (this.level.camera.height / 2);
        this.level.snapCameraToLevel();
        var player = new ECS.Entity();
        player.addComponent(new ECS.Components.IsPlayer());
        player.addComponent(new ECS.Components.TilePos());
        player.addComponent(new ECS.Components.TorchStr());
        player["pos"].value.x = this.level.entrance.x;
        player["pos"].value.y = this.level.entrance.y;
        this.level.EntityList.push(player);
        for (var i = 0; i < 20; i++) {
            var enemy = new ECS.Entity();
            enemy.addComponent(new ECS.Components.IsEnemy());
            enemy.addComponent(new ECS.Components.TilePos());
            do {
                enemy["pos"].value.x = randomInt(0, 159);
                enemy["pos"].value.y = randomInt(0, 159);
            } while (this.level.cells[enemy["pos"].value.x][enemy["pos"].value.y].tileID !== 2);
            this.level.EntityList.push(enemy);
        }
        this.state = "MainMenu";
    };
    Game.prototype.update = function (delta) {
        switch (this.state) {
            case "MainMenu":
                this.state = "Game";
                break;
            case "Game":
                if (this.deltaPaused > 0) {
                    delta -= this.deltaPaused;
                    if (delta < 0) {
                        delta = 0;
                    }
                    this.deltaPaused = 0;
                }
                this.level.update(delta);
                break;
            case "GamePause":
                break;
            case "GameOver":
                this.state = "MainMenu";
                break;
            default:
                break;
        }
    };
    Game.prototype.draw = function () {
        switch (this.state) {
            case "MainMenu":
                break;
            case "Game":
                if (this.clearScreen || this.level.redraw) {
                    this.ctx.clearRect(0, 0, this.screen.width, this.screen.height);
                    this.bufferCtx.clearRect(0, 0, this.screen.width, this.screen.height);
                    this.clearScreen = false;
                }
                if (this.level.redraw) {
                    this.bufferCtx.fillStyle = "#ffffff";
                    this.level.draw(this.bufferCtx);
                    this.bufferCtx.fillStyle = "#000000";
                    this.bufferCtx.fillRect(0, GAMEINFO.GAMESCREEN_TILE_HEIGHT * GAMEINFO.TILESIZE, GAMEINFO.TEXTLOG_TILE_WIDTH * GAMEINFO.TILESIZE, this.screen.height);
                    this.bufferCtx.fillStyle = "#000000";
                    this.bufferCtx.fillRect(GAMEINFO.GAMESCREEN_TILE_WIDTH * GAMEINFO.TILESIZE, 0, this.screen.height, this.screen.width);
                    this.bufferCtx.fillStyle = "#ffffff";
                    this.level.drawMiniMap(this.bufferCtx);
                    this.level.drawEntities(this.bufferCtx);
                    this.bufferCtx.fillStyle = "#ffffff";
                    this.bufferCtx.fillText("Arrow keys to move.", 10, GAMEINFO.GAME_PIXEL_HEIGHT - 12);
                    this.ctx.fillStyle = "#ffffff";
                    this.ctx.drawImage(this.buffer, 0, 0, GAMEINFO.GAME_PIXEL_WIDTH, GAMEINFO.GAME_PIXEL_HEIGHT, 0, 0, GAMEINFO.GAME_PIXEL_WIDTH, GAMEINFO.GAME_PIXEL_HEIGHT);
                    this.level.redraw = false;
                }
                break;
            case "GamePause":
                if (this.change) {
                    this.ctx.globalAlpha = 0.7;
                    this.ctx.fillStyle = "black";
                    this.ctx.fillRect(0, 0, this.screen.width, this.screen.height);
                    this.ctx.globalAlpha = 1.0;
                    this.ctx.font = "18px Verdana";
                    this.ctx.textAlign = "center";
                    this.ctx.fillStyle = "white";
                    this.ctx.fillText("PAUSED", ((this.screen.width / 2) | 0), ((this.screen.height / 2) | 0));
                    this.change = false;
                }
                break;
            case "GameOver":
                break;
            default:
                break;
        }
    };
    Game.prototype.render = function () {
        var now = performance.now();
        var delta = (now - this.then);
        this.then = now;
        this.update(delta);
        this.draw();
        this._loopHandle = window.requestAnimationFrame(this.render.bind(this));
    };
    Game.prototype.run = function () {
        console.log("Game running");
        this._loopHandle = window.requestAnimationFrame(this.render.bind(this));
    };
    Game.prototype.stop = function () {
        console.log("Game stopped");
        window.cancelAnimationFrame(this._loopHandle);
    };
    Game.prototype.pause = function () {
        if (this.state === "Game") {
            this.state = "GamePause";
            this.change = true;
            this.timePaused = performance.now();
        }
    };
    Game.prototype.unpause = function () {
        if (this.state === "GamePause") {
            this.state = "Game";
            this.change = this.clearScreen = true;
            this.deltaPaused = performance.now() - this.timePaused;
            this.timePaused = 0;
            this.level.redraw = true;
        }
    };
    return Game;
}());
function onResize() {
    var canvas = document.getElementById("gameCanvas");
    var scaleX = window.innerWidth / canvas.width;
    var scaleY = window.innerHeight / canvas.height;
    var scaleToFit = Math.min(scaleX, scaleY) | 0;
    scaleToFit = (scaleToFit <= 0) ? 1 : scaleToFit;
    var size = [canvas.width * scaleToFit, canvas.height * scaleToFit];
    var offset = this.offset = [(window.innerWidth - size[0]) / 2, (window.innerHeight - size[1]) / 2];
    var stage = document.getElementById("stage");
    var rule = "translate(" + offset[0] + "px, " + offset[1] + "px) scale(" + scaleToFit + ")";
    stage.style.transform = rule;
    stage.style.webkitTransform = rule;
}
window.onload = function () {
    onResize();
    window.addEventListener("resize", onResize, false);
    window.onkeydown = Input.KB.keyDown;
    window.onkeyup = Input.KB.keyUp;
    var game = new Game(document.getElementById("gameCanvas"));
    ImageCache.Loader.add("sheet", "sheet1.png");
    ImageCache.Loader.load(function () {
        game.init();
        window.onblur = game.pause.bind(game);
        window.onfocus = game.unpause.bind(game);
        game.run();
    });
};
