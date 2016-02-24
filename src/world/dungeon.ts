/// <reference path="../system/game_config.ts"/>
/// <reference path="../system/camera.ts"/>

/// <reference path="./level.ts"/>
/// <reference path="./cell.ts"/>
/// <reference path="./room.ts"/>

/// <reference path="../util/utility.ts"/>
/// <reference path="../types/types.ts"/>

class Dungeon extends Level {
    protected rooms: Room[];

    constructor(width: number, height: number, camera: Camera) {
        super(width, height, camera);

        this.rooms = [];

        for (let x = 0; x < this.width; x++) {
            for (let y = 0; y < this.height; y++) {
                if (this.cells[x] === undefined) {
                    this.cells[x] = [];
                }
                this.cells[x][y] = new Cell(0);
            }
        }
        this.generate(32);
    }

    scan(room: Room, wall: WALL, adjustForDoor: boolean): boolean {
        let result: boolean = true;
        let x: number = (wall === WALL.W) ? room.x - 1 : room.x;
        let y: number = (wall === WALL.N) ? room.y - 1 : room.y;
        let w: number = (adjustForDoor && (wall === WALL.W || wall === WALL.E)) ? room.w + 1 : room.w;
        let h: number = (adjustForDoor && (wall === WALL.N || wall === WALL.S)) ? room.h + 1 : room.h;

        w = (wall === WALL.N || wall === WALL.S) ? w + 1 : w;
        h = (wall === WALL.W || wall === WALL.E) ? h + 1 : h;

        if (adjustForDoor) {
            x = (wall === WALL.E) ? x - 1 : x;
            y = (wall === WALL.S) ? y - 1 : y;
        }
        if (wall === WALL.N || wall === WALL.S) { x -= 1; }
        if (wall === WALL.W || wall === WALL.E) { y -= 1; }
        for (let x0: number = x; !(x0 > (x + w)) && result; x0++) {
            for (let y0: number = y; !(y0 > (y + h)) && result; y0++) {
                result = result && (this.cells[x0] !== undefined)
                    && (this.cells[x0][y0] !== undefined)
                    && (this.cells[x0][y0].tileID === 0);
            }
        }
        return result;
    }

    addRoom(room: Room): void {
        for (let x0: number = room.x; (x0 < room.x + room.w); x0++) {
            for (let y0: number = room.y; (y0 < room.y + room.h); y0++) {
                this.cells[x0][y0].tileID = 2;
            }
        }
    }
    addTile(p: Point, tid: number): void {
        this.cells[p.x][p.y].tileID = tid;
    }
    makeRoom(p: { x: number, y: number, w: WALL } = { x: -1, y: -1, w: -1 }, feature: string = "R", adjustForDoor: boolean = false): Room {
        let room: Room = new Room();
        room.roomType = feature;

        if (feature === "R") {
            do {
                room.w = randomInt(5, this.width / 5);
                room.w = room.w % 2 === 0 ? room.w - 1 : room.w;

                room.h = randomInt(5, this.height / 5);
                room.h = room.h % 2 === 0 ? room.h - 1 : room.h;
            } while (room.w * room.h > (this.width * this.height) / 4);
        } else if (feature === "C") {
            room.w = (p.w === WALL.N || p.w === WALL.S) ? 3 : randomInt(5, 9); // this.width / 4);
            room.w = room.w % 2 === 0 ? room.w - 1 : room.w;

            room.h = (p.w === WALL.W || p.w === WALL.E) ? 3 : randomInt(5, 9); // this.height / 4);
            room.h = room.h % 2 === 0 ? room.h - 1 : room.h;
        }

        room.x = (p.w === WALL.N || p.w === WALL.S) ? p.x - Math.floor(room.w / 2) : p.x;
        room.x = (p.w === WALL.W) ? room.x - (room.w - 1) : room.x;

        room.y = (p.w === WALL.W || p.w === WALL.E) ? p.y - Math.floor(room.h / 2) : p.y;
        room.y = (p.w === WALL.N) ? room.y - (room.h - 1) : room.y;

        if (adjustForDoor) { // make room for a door if the last feature was a corridor
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
    }
    generate(rooms: number) {
        let gRooms: number = 0;
        let weight: number = 0;
        let roomStack: Room[] = [];

        let currentFeature: string = "";
        let lastFeature: string = "R";
        let attempts = 0;

        let feature: number = randomInt(0, 100);
        let room: Room = this.makeRoom();

        room.x = randomInt(1, Math.floor(this.width - room.w) - 1);
        room.y = randomInt(1, Math.floor(this.height - room.h) - 1);
        roomStack[roomStack.length] = room;
        this.addRoom(room);
        this.rooms.push(room);
        gRooms++;

        this.entrance = new Point(room.x + Math.floor(room.w / 2), room.y + Math.floor(room.h / 2));
        this.addTile(this.entrance, 5);

        let p: { x: number, y: number, w: number };
        while (roomStack.length > 0 && gRooms < rooms) {
            if (feature > (65 + weight)) {
                currentFeature = "C";
            } else {
                currentFeature = "R";
            }

            do {
                if (attempts > 5 || attempts === 0) {
                    if (roomStack[roomStack.length - 1].walls.length === 0) {
                        roomStack.pop();
                    }
                    if (roomStack.length === 0) { break; }
                    p = roomStack[roomStack.length - 1].getRandomWall();
                    lastFeature = roomStack[roomStack.length - 1].roomType;
                }
                room = this.makeRoom(p, currentFeature, currentFeature !== lastFeature);

                attempts++;
            } while (!this.scan(room, p.w, currentFeature !== lastFeature));
            attempts = 0;
            if (roomStack.length === 0) { break; }

            if (currentFeature !== lastFeature) {
                this.addTile(p, 3); // Add Door
            }

            roomStack[roomStack.length] = room;
            this.addRoom(room);

            if (currentFeature === "C") {
                weight += 10;
            } else {
                this.rooms.push(room);
                gRooms++;
                weight -= 10;
            }
            lastFeature = roomStack[roomStack.length - 1].roomType;
            currentFeature = "";

            feature = randomInt(0, 100);
        }
        let lastRoom = this.rooms[this.rooms.length - 1];
        this.addTile({ x: lastRoom.x + Math.floor(lastRoom.w / 2), y: lastRoom.y + Math.floor(lastRoom.h / 2) }, 6);
        for (let x = 0; x < this.width; x++) {
            for (let y = 0; y < this.height; y++) {
                if (this.cells[x][y].tileID === 2) {
                    for (let ix = -1; ix <= 1; ix++) {
                        for (let iy = -1; iy <= 1; iy++) {
                            if (this.cells[x + ix] && this.cells[x + ix][y + iy] && this.cells[x + ix][y + iy].tileID === 0) {
                                this.cells[x + ix][y + iy].tileID = 4;
                            }
                        }
                    }
                }
            }
        }

    }
}
