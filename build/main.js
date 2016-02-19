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

var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Cave = (function (_super) {
    __extends(Cave, _super);
    function Cave(width, height, camera) {
        _super.call(this, width, height, camera);
        for (var x = 0; x < this.width; x++) {
            for (var y = 0; y < this.height; y++) {
                if (this.cells[x] === undefined)
                    this.cells[x] = [];
                if ((Math.random() * 100) < 50 || (x === 0 || x === (this.width - 1) || y === 0 || y === (this.height - 1))) {
                    this.cells[x][y] = new Cell(0);
                }
                else {
                    this.cells[x][y] = new Cell(1);
                }
            }
        }
        for (var x = 5; x < this.width - 5; x++) {
            this.cells[x][(this.height / 2) - 1].tileID = 1;
            this.cells[x][(this.height / 2)].tileID = 1;
            this.cells[x][(this.height / 2) + 1].tileID = 1;
        }
        for (var y = 5; y < this.width - 5; y++) {
            this.cells[(this.height / 2) - 1][y].tileID = 1;
            this.cells[(this.height / 2)][y].tileID = 1;
            this.cells[(this.height / 2) + 1][y].tileID = 1;
        }
        this.cellularAutomata([5, 6, 7, 8], [4, 5, 6, 7, 8]);
        this.cellularAutomata([5, 6, 7, 8], [4, 5, 6, 7, 8]);
        this.cellularAutomata([5, 6, 7, 8], [4, 5, 6, 7, 8]);
        this.cellularAutomata([5, 6, 7, 8], [4, 5, 6, 7, 8]);
        this.cellularAutomata([5, 6, 7, 8], [4, 5, 6, 7, 8]);
        for (var x = 1; x < this.width - 1; x++) {
            for (var y = 1; y < this.height - 1; y++) {
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
        var mx = (this.width / 2);
        var my = (this.height / 2);
        while (this.cells[mx][my].tileID !== 1) {
            mx++;
        }
        this.floodFill(mx, my, 1, 2);
        for (var x = 1; x < this.width - 1; x++) {
            for (var y = 1; y < this.height - 1; y++) {
                if (this.cells[x][y].tileID === 1) {
                    this.cells[x][y].tileID = 0;
                }
            }
        }
    }
    Cave.prototype.getLiveNeighbors = function (x, y) {
        var count = 0;
        for (var nx = x - 1; nx <= x + 1; nx++) {
            if (nx < 0 || nx > this.width)
                continue;
            for (var ny = y - 1; ny <= y + 1; ny++) {
                if (ny < 0 || ny > this.height)
                    continue;
                if (!(nx === x && ny === y)) {
                    count += this.cells[nx][ny].tileID;
                }
            }
        }
        return 8 - count;
    };
    Cave.prototype.cellularAutomata = function (B, S) {
        for (var x = 1; x < this.width - 1; x++) {
            for (var y = 1; y < this.height - 1; y++) {
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

var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
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
var Dungeon = (function (_super) {
    __extends(Dungeon, _super);
    function Dungeon(width, height, camera) {
        _super.call(this, width, height, camera);
        for (var x = 0; x < this.width; x++) {
            for (var y = 0; y < this.height; y++) {
                if (this.cells[x] === undefined)
                    this.cells[x] = [];
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
        if (wall === WALL.N || wall === WALL.S)
            x -= 1;
        if (wall === WALL.W || wall === WALL.E)
            y -= 1;
        for (var x0 = x; !(x0 > (x + w)) && result; x0++) {
            for (var y0 = y; !(y0 > (y + h)) && result; y0++) {
                result = result && (this.cells[x0] !== undefined) && (this.cells[x0][y0] !== undefined) && (this.cells[x0][y0].tileID === 0);
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
    Dungeon.prototype.addDoor = function (p) {
        this.cells[p.x][p.y].tileID = 3;
    };
    Dungeon.prototype.makeRoom = function (p, lastWasRoom) {
        if (p === void 0) { p = { x: -1, y: -1, w: -1 }; }
        if (lastWasRoom === void 0) { lastWasRoom = true; }
        var room = new Room();
        do {
            room.w = randomInt(5, this.width / 5);
            room.w = room.w % 2 === 0 ? room.w - 1 : room.w;
            room.h = randomInt(5, this.height / 5);
            room.h = room.h % 2 === 0 ? room.h - 1 : room.h;
        } while (room.w * room.h > (this.width * this.height) / 4);
        room.x = (p.w === WALL.N || p.w === WALL.S) ? p.x - Math.floor(room.w / 2) : p.x;
        room.x = (p.w === WALL.W) ? room.x - (room.w - 1) : room.x;
        room.y = (p.w === WALL.W || p.w === WALL.E) ? p.y - Math.floor(room.h / 2) : p.y;
        room.y = (p.w === WALL.N) ? room.y - (room.h - 1) : room.y;
        if (!lastWasRoom) {
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
    Dungeon.prototype.makeCorridor = function (p, lastWasRoom) {
        if (p === void 0) { p = { x: -1, y: -1, w: -1 }; }
        if (lastWasRoom === void 0) { lastWasRoom = true; }
        var room = new Room();
        room.w = (p.w === WALL.N || p.w === WALL.S) ? 3 : randomInt(5, 9);
        room.w = room.w % 2 === 0 ? room.w - 1 : room.w;
        room.h = (p.w === WALL.W || p.w === WALL.E) ? 3 : randomInt(5, 9);
        room.h = room.h % 2 === 0 ? room.h - 1 : room.h;
        room.x = (p.w === WALL.N || p.w === WALL.S) ? p.x - Math.floor(room.w / 2) : p.x;
        room.x = (p.w === WALL.W) ? room.x - (room.w - 1) : room.x;
        room.y = (p.w === WALL.W || p.w === WALL.E) ? p.y - Math.floor(room.h / 2) : p.y;
        room.y = (p.w === WALL.N) ? room.y - (room.h - 1) : room.y;
        if (lastWasRoom) {
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
        var roomArray = [];
        var gRooms = 0;
        var weight = 0;
        var lastWasRoom = true;
        var attempts = 0;
        var feature = randomInt(0, 100);
        var room = this.makeRoom();
        room.x = Math.floor((this.width / 2) - (room.w / 2));
        room.y = Math.floor((this.height / 2) - (room.h / 2));
        roomArray[roomArray.length] = room;
        this.addRoom(room);
        gRooms++;
        var p;
        while (roomArray.length > 0 && gRooms < rooms) {
            if (feature > (65 + weight)) {
                do {
                    if (attempts > 5 || attempts === 0) {
                        if (roomArray[roomArray.length - 1].walls.length === 0)
                            roomArray.pop();
                        if (roomArray.length === 0)
                            break;
                        p = roomArray[roomArray.length - 1].getRandomWall();
                    }
                    room = this.makeCorridor(p, lastWasRoom);
                    attempts++;
                } while (!this.scan(room, p.w, lastWasRoom));
                attempts = 0;
                if (roomArray.length === 0)
                    break;
                if (lastWasRoom)
                    this.addDoor(p);
                roomArray[roomArray.length] = room;
                this.addRoom(room);
                weight += 10;
                lastWasRoom = false;
            }
            else {
                do {
                    if (attempts > 5 || attempts === 0) {
                        if (roomArray[roomArray.length - 1].walls.length === 0)
                            roomArray.pop();
                        if (roomArray.length === 0)
                            break;
                        p = roomArray[roomArray.length - 1].getRandomWall();
                    }
                    room = this.makeRoom(p, lastWasRoom);
                    attempts++;
                } while (!this.scan(room, p.w, !lastWasRoom));
                attempts = 0;
                if (roomArray.length === 0)
                    break;
                if (!lastWasRoom)
                    this.addDoor(p);
                roomArray[roomArray.length] = room;
                this.addRoom(room);
                gRooms++;
                weight -= 10;
                lastWasRoom = true;
            }
            feature = randomInt(0, 100);
        }
    };
    return Dungeon;
}(Level));

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
            if (_isUp[keyCode])
                _wasDown[keyCode] = true;
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
        this.level = new Dungeon(160, 160, new Camera(GAMEINFO.GAMESCREEN_TILE_WIDTH, GAMEINFO.GAMESCREEN_TILE_HEIGHT));
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
                    if (delta < 0)
                        delta = 0;
                    this.deltaPaused = 0;
                }
                this.level.update();
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
                if (this.clearScreen) {
                    this.ctx.clearRect(0, 0, this.screen.width, this.screen.height);
                    this.ctx.fillStyle = "#bbb";
                    this.ctx.fillRect(0, GAMEINFO.GAMESCREEN_TILE_HEIGHT * GAMEINFO.TILESIZE, GAMEINFO.TEXTLOG_TILE_WIDTH * GAMEINFO.TILESIZE, this.screen.height);
                    this.ctx.fillStyle = "#ddd";
                    this.ctx.fillRect(GAMEINFO.GAMESCREEN_TILE_WIDTH * GAMEINFO.TILESIZE, 0, this.screen.height, this.screen.width);
                    this.level.renderMiniMap();
                    this.clearScreen = false;
                }
                if (this.level.redraw) {
                    this.level.draw(this.bufferCtx);
                    this.level.drawMiniMap(this.bufferCtx);
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
    game.init();
    window.onblur = game.pause.bind(game);
    window.onfocus = game.unpause.bind(game);
    game.run();
};
