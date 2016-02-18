var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
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
    }
    Room.prototype.getRandomWall = function () {
        var randWall;
        var val = randomInt(0, 400);
        if (val < 150) {
            randWall = WALL.W;
        }
        else if (val < 300) {
            randWall = WALL.E;
        }
        else if (val < 350) {
            randWall = WALL.N;
        }
        else if (val < 400) {
            randWall = WALL.S;
        }
        var x = 0;
        var y = 0;
        if (randWall === WALL.N) {
            x = randomInt(this.x, this.x + this.w - 3);
            y = this.y - 1;
        }
        else if (randWall === WALL.S) {
            x = randomInt(this.x, this.x + this.w - 3);
            y = this.y + this.h;
        }
        else if (randWall === WALL.W) {
            x = this.x - 1;
            y = randomInt(this.y, this.y + this.h - 3);
        }
        else if (randWall === WALL.E) {
            x = this.x + this.w;
            y = randomInt(this.y, this.y + this.h - 3);
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
        this.generate(25);
    }
    Dungeon.prototype.scan = function (room) {
        var result = true;
        for (var x0 = room.x; !(x0 >= (room.x + room.w)) && result; x0++) {
            for (var y0 = room.y; !(y0 >= (room.y + room.h)) && result; y0++) {
                result = result && (this.cells[x0] !== undefined) && (this.cells[x0][y0] !== undefined);
                result = result && (this.cells[x0][y0].tileID === 0);
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
    Dungeon.prototype.makeRoom = function (p) {
        if (p === void 0) { p = { x: -1, y: -1, w: WALL.N }; }
        var room = new Room();
        do {
            room.w = randomInt(5, this.width / 5);
            room.w = room.w % 2 === 0 ? room.w - 1 : room.w;
            room.h = randomInt(5, this.height / 5);
            room.h = room.h % 2 === 0 ? room.h - 1 : room.h;
        } while (room.w * room.h > (this.width * this.height) / 4);
        room.x = p.x;
        room.y = p.y;
        return room;
    };
    Dungeon.prototype.makeCorridor = function (p) {
        if (p === void 0) { p = { x: -1, y: -1, w: WALL.N }; }
        var room = new Room();
        room.w = (p.w === WALL.N || p.w === WALL.S) ? 3 : randomInt(7, this.width / 4);
        room.w = room.w % 2 === 0 ? room.w - 1 : room.w;
        room.h = (p.w === WALL.W || p.w === WALL.E) ? 3 : randomInt(7, this.height / 4);
        room.h = room.h % 2 === 0 ? room.h - 1 : room.h;
        room.x = p.x;
        room.y = p.y;
        return room;
    };
    Dungeon.prototype.generate = function (rooms) {
        var roomArray = [];
        var gRooms = 0;
        var weight = 0;
        var failures = 0;
        var feature = randomInt(0, 100);
        var room = this.makeRoom();
        room.x = randomInt(1, this.width - room.w);
        room.y = randomInt(1, this.height - room.h);
        roomArray[roomArray.length] = room;
        this.addRoom(room);
        gRooms++;
        var p;
        while (roomArray.length > 0 && gRooms < rooms) {
            if (feature > (45 + weight)) {
                p = roomArray[roomArray.length - 1].getRandomWall();
                room = this.makeCorridor(p);
                while (failures < 100 && !this.scan(room)) {
                    failures++;
                    p = roomArray[roomArray.length - 1].getRandomWall();
                    room = this.makeCorridor(p);
                }
                if (failures >= 100) {
                    roomArray.pop();
                    failures = 0;
                    continue;
                }
                roomArray[roomArray.length] = room;
                this.addRoom(room);
                weight += 5;
                failures = 0;
            }
            else {
                p = roomArray[roomArray.length - 1].getRandomWall();
                room = this.makeRoom(p);
                while (failures < 100 && !this.scan(room)) {
                    failures++;
                    p = roomArray[roomArray.length - 1].getRandomWall();
                    room = this.makeRoom(p);
                }
                if (failures >= 100) {
                    roomArray.pop();
                    failures = 0;
                    continue;
                }
                roomArray[roomArray.length] = room;
                this.addRoom(room);
                gRooms++;
                weight -= 10;
                failures = 0;
            }
            feature = randomInt(0, 100);
        }
    };
    return Dungeon;
}(Level));
