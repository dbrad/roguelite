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
        this.rooms = [];
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
                room.w = randomInt(5, this.width / 5);
                room.w = room.w % 2 === 0 ? room.w - 1 : room.w;
                room.h = randomInt(5, this.height / 5);
                room.h = room.h % 2 === 0 ? room.h - 1 : room.h;
            } while (room.w * room.h > (this.width * this.height) / 4);
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
        room.x = randomInt(0, Math.floor(this.width - room.w));
        room.y = randomInt(0, Math.floor(this.height - room.h));
        roomStack[roomStack.length] = room;
        this.addRoom(room);
        this.rooms.push(room);
        gRooms++;
        this.entrance = { x: room.x + Math.floor(room.w / 2), y: room.y + Math.floor(room.h / 2) };
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
                    if (roomStack[roomStack.length - 1].walls.length === 0)
                        roomStack.pop();
                    if (roomStack.length === 0)
                        break;
                    p = roomStack[roomStack.length - 1].getRandomWall();
                    lastFeature = roomStack[roomStack.length - 1].roomType;
                }
                room = this.makeRoom(p, currentFeature, currentFeature !== lastFeature);
                attempts++;
            } while (!this.scan(room, p.w, currentFeature !== lastFeature));
            attempts = 0;
            if (roomStack.length === 0)
                break;
            if (currentFeature !== lastFeature)
                this.addTile(p, 3);
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
        for (var x = 0; x < this.width; x++) {
            for (var y = 0; y < this.height; y++) {
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
