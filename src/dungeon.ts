/// <reference path="./game_objs.ts"/>

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function shuffle(array: any[]) {
  let currentIndex: number = array.length, temporaryValue: number, randomIndex: number;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
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
    shuffle(this.walls);
  }
  getRandomWall(): {x: number, y: number, w: WALL} {
    let randWall: WALL = this.walls.pop();

    let x: number, y: number;
    if (randWall === WALL.N) {
      x = this.x + Math.floor(this.w / 2);
      y = this.y - 1;
    } else if (randWall === WALL.S) {
      x = this.x + Math.floor(this.w / 2);
      y = this.y + this.h;
    } else if (randWall === WALL.W) {
      x = this.x - 1;
      y = this.y + Math.floor(this.h / 2);
    } else if (randWall === WALL.E) {
      x = this.x + this.w;
      y = this.y + Math.floor(this.h / 2);
    }
    return {x: x, y: y, w: randWall};
  }
}

class Dungeon extends Level {
  protected rooms: Room[];

  constructor(width: number, height: number, camera: Camera) {
    super(width, height, camera);

    this.rooms = [];

    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {
        if (this.cells[x] === undefined)
          this.cells[x] = [];
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
    if (wall === WALL.N || wall === WALL.S) x -= 1;
    if (wall === WALL.W || wall === WALL.E) y -= 1;
    for (let x0: number = x; !(x0 > (x + w)) && result; x0++) {
      for (let y0: number = y; !(y0 > (y + h)) && result; y0++) {
        result = result && (this.cells[x0] !== undefined ) && (this.cells[x0][y0] !== undefined) && (this.cells[x0][y0].tileID === 0);
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
  addDoor(p: Point): void {
    this.cells[p.x][p.y].tileID = 3;
  }
  makeRoom(p: {x: number, y: number, w: WALL} = { x: -1, y: -1, w: -1 }, feature: string = "R", adjustForDoor: boolean = true): Room {
    let room: Room = new Room();
    if (feature === "R") {
      do {
        room.w = randomInt(3, this.width / 5);
        room.w = room.w % 2 === 0 ? room.w - 1 : room.w;

        room.h = randomInt(3, this.height / 5);
        room.h = room.h % 2 === 0 ? room.h - 1 : room.h;
      } while (room.w * room.h > (this.width * this.height) / 4);
    } else if ( feature === "C") {
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

    let currentFeature: string = "";
    let lastFeature: string = "R";
    let attempts = 0;

    let feature: number = randomInt(0, 100);
    let room: Room = this.makeRoom();

    room.x = Math.floor((this.width / 2) - (room.w / 2));
    room.y = Math.floor((this.height / 2) - (room.h / 2));
    this.rooms[this.rooms.length] = room;
    this.addRoom(room);
    gRooms++;

    let p: {x: number, y: number, w: number};
    while (this.rooms.length > 0 && gRooms < rooms) {
      if (feature > (65 + weight)) {
        currentFeature = "C";
      } else {
        currentFeature = "R";
      }

        do {
          if ( attempts > 5 || attempts === 0 ) {
            if (this.rooms[this.rooms.length - 1].walls.length === 0)
              this.rooms.pop();
            if (this.rooms.length === 0) break;
            p = this.rooms[this.rooms.length - 1].getRandomWall();
          }
          room = this.makeRoom(p, currentFeature, currentFeature !== lastFeature);

          attempts++;
        } while (!this.scan(room, p.w, currentFeature !== lastFeature));
        attempts = 0;
        if (this.rooms.length === 0) break;
        if (currentFeature !== lastFeature)
          this.addDoor(p);

        this.rooms[this.rooms.length] = room;
        this.addRoom(room);

        if (currentFeature === "C") {
          weight += 10;
        } else {
          gRooms++;
          weight -= 10;
        }
        lastFeature = currentFeature;
        currentFeature = "";

      feature = randomInt(0, 100);
    }
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
