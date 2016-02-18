/// <reference path="./game_objs.ts"/>

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
enum WALL { N, E, S, W };
class Room {
  x: number;
  y: number;
  w: number;
  h: number;
  walls: WALL[];
  constructor() {
    this.x = 0;
    this.y = 0;
    this.w = 0;
    this.h = 0;
    this.walls = [WALL.N, WALL.E, WALL.S, WALL.W];
  }
  getRandomWall(): {x: number, y: number, w: WALL} {

    let randWall: WALL;
    let val = randomInt(0, 400);
    if (val < 150) {
      randWall = WALL.W;
    } else if (val < 300) {
      randWall = WALL.E;
    } else if (val < 350) {
      randWall = WALL.N;
    } else if (val < 400) {
      randWall = WALL.S;
    }
    let x: number = 0;
    let y: number = 0;
    if (randWall === WALL.N) {
      x = randomInt(this.x, this.x + this.w - 3);
      y = this.y - 1;
    } else if (randWall === WALL.S) {
      x = randomInt(this.x, this.x + this.w - 3);
      y = this.y + this.h;
    } else if (randWall === WALL.W) {
      x = this.x - 1;
      y = randomInt(this.y, this.y + this.h - 3);
    } else if (randWall === WALL.E) {
      x = this.x + this.w;
      y = randomInt(this.y, this.y + this.h - 3);
    }
    return {x: x, y: y, w: randWall};
  }
}

class Dungeon extends Level {

  constructor(width: number, height: number, camera: Camera) {
    super(width, height, camera);

    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {
        if (this.cells[x] === undefined)
          this.cells[x] = [];
        this.cells[x][y] = new Cell(0);
      }
    }
    this.generate(25);
  }

  scan(room: Room): boolean {
    let result: boolean = true;
    for (let x0: number = room.x; !(x0 >= (room.x + room.w)) && result; x0++) {
      for (let y0: number = room.y; !(y0 >= (room.y + room.h)) && result; y0++) {
        result = result && (this.cells[x0] !== undefined ) && (this.cells[x0][y0] !== undefined);
        result = result && (this.cells[x0][y0].tileID === 0);
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
  makeRoom(p: {x: number, y: number, w: WALL} = { x: -1, y: -1, w: WALL.N }): Room {
    let room: Room = new Room();
    do {
      room.w = randomInt(5, this.width / 5);
      room.w = room.w % 2 === 0 ? room.w - 1 : room.w;
      room.h = randomInt(5, this.height / 5);
      room.h = room.h % 2 === 0 ? room.h - 1 : room.h;
    } while (room.w * room.h > (this.width * this.height) / 4);
    room.x = p.x;
    room.y = p.y;
    return room;
  }
  makeCorridor(p: {x: number, y: number, w: WALL} = { x: -1, y: -1, w: WALL.N }): Room {
    let room: Room = new Room();
    room.w = (p.w === WALL.N || p.w === WALL.S) ? 3 : randomInt(7, this.width / 4);
    room.w = room.w % 2 === 0 ? room.w - 1 : room.w;
    room.h = (p.w === WALL.W || p.w === WALL.E) ? 3 : randomInt(7, this.height / 4);
    room.h = room.h % 2 === 0 ? room.h - 1 : room.h;
    room.x = p.x;
    room.y = p.y;
    return room;
  }
  generate(rooms: number) {
    let roomArray: Room[] = [];
    let gRooms: number = 0;
    let weight: number = 0;
    let failures: number = 0;

    let feature: number = randomInt(0, 100);

    let room: Room = this.makeRoom();
    room.x = randomInt(1, this.width - room.w);
    room.y = randomInt(1, this.height - room.h);
    roomArray[roomArray.length] = room;
    this.addRoom(room);
    gRooms++;

    let p: {x: number, y: number, w: number};
    while (roomArray.length > 0 && gRooms < rooms) {
      if (feature > (45 + weight)) { // Corridor

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
      } else { // Room

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

  }
}
