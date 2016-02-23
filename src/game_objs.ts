namespace GAMEINFO {
  export const TILESIZE = 16;
  export const GAME_PIXEL_WIDTH = 800;
  export const GAME_PIXEL_HEIGHT = 448;

  export const GAME_TILE_WIDTH = GAME_PIXEL_WIDTH / TILESIZE;
  export const GAME_TILE_HEIGHT = GAME_PIXEL_HEIGHT / TILESIZE;

  export const TEXTLOG_TILE_HEIGHT = 6;

  export const GAMESCREEN_TILE_WIDTH = GAME_TILE_WIDTH * .8; // 40;
  export const GAMESCREEN_TILE_HEIGHT = GAME_TILE_HEIGHT - TEXTLOG_TILE_HEIGHT;

  export const SIDEBAR_TILE_WIDTH = GAME_TILE_WIDTH - GAMESCREEN_TILE_WIDTH;
  export const SIDEBAR_TILE_HEIGHT = GAME_TILE_HEIGHT;

  export const TEXTLOG_TILE_WIDTH = GAME_TILE_WIDTH - SIDEBAR_TILE_WIDTH;

}

class TileSet {}
interface ComponentDictionary {
  [index: string]: Component;
}

class Entity {
  public components: ComponentDictionary;
  public id: number;
  private static autoID: number;
  constructor() {
    this.components = {};
    if (!Entity.autoID)
      Entity.autoID = 0;
    this.id = Entity.autoID++;
  }
  addComponent(component: Component) {
    this.components[component.name] = component;
    this[component.name] = component;
  }
}

class Component {
  public name: string;
  constructor(name: string) {
    this.name = name;
  }
}
class IsPlayerCom extends Component {
  public value: boolean = true;
  constructor() {
    super("isPlayer");
  }
}
class TilePosCom extends Component {
  public x: number = 0;
  public y: number = 0;
  constructor() {
    super("pos");
  }
}

interface Point {
  x: number;
  y: number;
}
class Item {}
class Cell {
  public tileID: number;
  public entityID: number;
  public itemIDs: number[];
  public visable: boolean;
  public discovered: boolean;

  constructor(tileID: number = 0, itemIDs: number[] = [], entityID: number = null ) {
    this.tileID = tileID;
    this.entityID = entityID;
    this.itemIDs = itemIDs;
    this.visable = true;
    this.discovered = false;
  }
}

class Camera {
  public width: number;
  public height: number;
  public xOffset: number;
  public yOffset: number;
  constructor(width: number, height: number, xOffset: number = 0, yOffset: number = 0) {
    this.width = width;
    this.height = height;
    this.xOffset = xOffset;
    this.yOffset = yOffset;
  }
}

class Level {
  public redraw: boolean = true;
  public render_m: boolean = true;
  public render_mm: boolean = true;
  public cells: Cell[][];
  protected width: number;
  protected height: number;
  protected MiniMap: HTMLCanvasElement;
  protected renderCache: HTMLCanvasElement;
  public entrance: Point;
  protected exit: Point;

  public camera: Camera;

  protected tileSet: TileSet;
  protected ItemList: Item[];
  public EntityList: Entity[];

  constructor(width: number, height: number, camera: Camera) {
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

  public snapCamera() {
    if (this.camera.xOffset <= 0)
      this.camera.xOffset = 0;
    if (this.camera.xOffset + this.camera.width >= this.width)
      this.camera.xOffset = (this.width - this.camera.width);
    if (this.camera.yOffset <= 0)
      this.camera.yOffset = 0;
    if (this.camera.yOffset + this.camera.height >= this.height)
      this.camera.yOffset = (this.height - this.camera.height);
  }
  private partOfRoom(cell: Cell) {
    return (cell.tileID === 2);
  }
  public floodDiscover(x: number, y: number) {
    let maxX: number = this.width - 1;
    let maxY: number = this.height - 1;
    let stack: Point[] = [];
    let index: number = 0;

    if (!stack[index])
      stack[index] = {x: 0, y: 0};
    stack[0].x = x;
    stack[0].y = y;
    this.cells[x][y].discovered = true;

    while (index >= 0) {
      if (!stack[index])
        stack[index] = {x: 0, y: 0};

      x = stack[index].x;
      y = stack[index].y;

      index--;

      if ((x > 0) && this.partOfRoom(this.cells[x - 1][y]) && !this.cells[x - 1][y].discovered) {
        this.cells[x - 1][y].discovered = true;
        index++;
        if (!stack[index])
          stack[index] = {x: 0, y: 0};

        stack[index].x = x - 1;
        stack[index].y = y;
      }

      if ((x < maxX) && this.partOfRoom(this.cells[x + 1][y]) && !this.cells[x + 1][y].discovered) {
        this.cells[x + 1][y].discovered = true;
        index++;
        if (!stack[index])
          stack[index] = {x: 0, y: 0};

        stack[index].x = x + 1;
        stack[index].y = y;
      }

      if ((y > 0) && this.partOfRoom(this.cells[x][y - 1]) && !this.cells[x][y - 1].discovered) {
        this.cells[x][y - 1].discovered = true;
        index++;
        if (!stack[index])
          stack[index] = {x: 0, y: 0};

        stack[index].x = x;
        stack[index].y = y - 1;
      }

      if ((y < maxY) && this.partOfRoom(this.cells[x][y + 1]) && !this.cells[x][y + 1].discovered) {
        this.cells[x][y + 1].discovered = true;
        index++;
        if (!stack[index])
          stack[index] = {x: 0, y: 0};

        stack[index].x = x;
        stack[index].y = y + 1;
      }
    }
    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {
        if (this.cells[x][y].tileID === 2 && this.cells[x][y].discovered) {
          for (let ix = -1; ix <= 1; ix++) {
            for (let iy = -1; iy <= 1; iy++) {
              if (this.cells[x + ix] && this.cells[x + ix][y + iy] && !this.cells[x + ix][y + iy].discovered) {
                this.cells[x + ix][y + iy].discovered = true;
              }
            }
          }
        }
      }
    }
  }
  public floodVision() {

  }
  protected floodFill(x: number, y: number, target: number, fill: number) {
    let maxX: number = this.width - 1;
    let maxY: number = this.height - 1;
    let stack: Point[] = [];
    let index: number = 0;

    if (!stack[index])
      stack[index] = {x: 0, y: 0};
    stack[0].x = x;
    stack[0].y = y;
    this.cells[x][y].tileID = fill;

    while (index >= 0) {
      if (!stack[index])
        stack[index] = {x: 0, y: 0};
      x = stack[index].x;
      y = stack[index].y;

      index--;

      if ((x > 0) && (this.cells[x - 1][y].tileID === target)) {
        this.cells[x - 1][y].tileID = fill;
        index++;
        if (!stack[index])
          stack[index] = {x: 0, y: 0};

        stack[index].x = x - 1;
        stack[index].y = y;
      }

      if ((x < maxX) && (this.cells[x + 1][y].tileID === target)) {
        this.cells[x + 1][y].tileID = fill;
        index++;
        if (!stack[index])
          stack[index] = {x: 0, y: 0};

        stack[index].x = x + 1;
        stack[index].y = y;
      }

      if ((y > 0) && (this.cells[x][y - 1].tileID === target)) {
        this.cells[x][y - 1].tileID = fill;
        index++;
        if (!stack[index])
          stack[index] = {x: 0, y: 0};

        stack[index].x = x;
        stack[index].y = y - 1;
      }

      if ((y < maxY) && (this.cells[x][y + 1].tileID === target)) {
        this.cells[x][y + 1].tileID = fill;
        index++;
        if (!stack[index])
          stack[index] = {x: 0, y: 0};

        stack[index].x = x;
        stack[index].y = y + 1;
      }
    }
  }

  getWidth(): number {
    return this.width;
  }

  getHeight(): number {
    return this.height;
  }

  private camThresh: number = 12;
  update(): void {
    let step: number = 1;
    let player: Entity = this.EntityList[0];
    let playerPos: TilePosCom = player["pos"];

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
    } else if (Input.KB.isDown(Input.KB.KEY.RIGHT)) {
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
    } else if (Input.KB.isDown(Input.KB.KEY.DOWN)) {
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
  }

  render(): void {
    let ctx: Context2D = <Context2D>this.renderCache.getContext("2d");
    for (let tx = 0, x = 0; tx < this.width; tx++) {
      for (let ty = 0, y = 0; ty < this.height; ty++) {
        if (!this.cells[tx] || !this.cells[tx][ty]) {
          ctx.fillStyle = "#000";
          ctx.fillRect(x * GAMEINFO.TILESIZE, y * GAMEINFO.TILESIZE, GAMEINFO.TILESIZE, GAMEINFO.TILESIZE);
          y++;
          continue;
        }

        let tCell = this.cells[tx][ty];
        if (!tCell.discovered) {
          ctx.fillStyle = "black";
          ctx.fillRect(x * GAMEINFO.TILESIZE, y * GAMEINFO.TILESIZE, GAMEINFO.TILESIZE, GAMEINFO.TILESIZE);
        } else if (!tCell.visable) {
          ctx.fillStyle = "#222";
          ctx.fillRect(x * GAMEINFO.TILESIZE, y * GAMEINFO.TILESIZE, GAMEINFO.TILESIZE, GAMEINFO.TILESIZE);
        } else {
          switch (tCell.tileID) {
            case 0: // Void / Unused
              ctx.fillStyle = "#000";
              break;
            case 1:
              ctx.fillStyle = "#AAA";
              break;
            case 2: // Floor
              ctx.fillStyle = "#999999";
              break;
            case 3: // Door
              ctx.fillStyle = "#FFF";
              break;
            case 4: // Wall
              ctx.fillStyle = "#222";
              break;
            case 5: // Stairs Up
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
  }
  draw(ctx: Context2D): void {
    if (this.render_m) {
      this.render();
      this.render_m = false;
    }
    ctx.drawImage(
      this.renderCache,
      this.camera.xOffset * GAMEINFO.TILESIZE, this.camera.yOffset * GAMEINFO.TILESIZE,
      GAMEINFO.GAMESCREEN_TILE_WIDTH * GAMEINFO.TILESIZE, GAMEINFO.GAMESCREEN_TILE_HEIGHT * GAMEINFO.TILESIZE,
      0, 0,
      GAMEINFO.GAMESCREEN_TILE_WIDTH * GAMEINFO.TILESIZE, GAMEINFO.GAMESCREEN_TILE_HEIGHT * GAMEINFO.TILESIZE );

      ctx.fillText("Camera x: " + this.camera.xOffset * GAMEINFO.TILESIZE, 10, 12);
      ctx.fillText("Camera y: " + this.camera.yOffset * GAMEINFO.TILESIZE, 10, 24);
  }
  renderMiniMap(): void {
    let ctx: Context2D = <Context2D>this.MiniMap.getContext("2d");

    for (let tx = 0, x = 0; tx < this.width; tx++) {
      for (let ty =  0, y = 0; ty < this.height; ty++) {
        if (!this.cells[tx] || !this.cells[tx][ty]) {
          ctx.fillStyle = "#000";
          ctx.fillRect(x, y, 1, 1);
          y++;
          continue;
        }

        let tCell = this.cells[tx][ty];
        if (!tCell.discovered) {
          ctx.fillStyle = "#000";
          ctx.fillRect(x, y, 1, 1);
        } else if (!tCell.visable) {
          ctx.fillStyle = "#222";
          ctx.fillRect(x, y, 1, 1);
        } else {
          switch (tCell.tileID) {
            case 0: // Wall
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
            case 5: // Stairs Up
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
  }
  drawMiniMap(ctx: Context2D): void {
    if (this.render_mm) {
      this.renderMiniMap();
      this.render_mm = false;
    }
    ctx.drawImage(this.MiniMap,
      0, 0,
      this.MiniMap.width, this.MiniMap.height,
      GAMEINFO.GAME_PIXEL_WIDTH - this.MiniMap.width, GAMEINFO.GAME_PIXEL_HEIGHT - this.MiniMap.height,
      this.MiniMap.width, this.MiniMap.height );

    ctx.strokeStyle = "#FFF";
    ctx.lineWidth = 2;
    ctx.strokeRect(GAMEINFO.GAME_PIXEL_WIDTH - this.width + this.camera.xOffset, GAMEINFO.GAME_PIXEL_HEIGHT - this.height + this.camera.yOffset, this.camera.width, this.camera.height );
  }
  drawEntities(ctx: Context2D) {
    ctx.fillStyle = "#F00";
    for (let e of this.EntityList) {
      let t: TilePosCom = <TilePosCom>(e.components["pos"]);
      if ((t.x * GAMEINFO.TILESIZE) + GAMEINFO.TILESIZE > this.camera.xOffset * GAMEINFO.TILESIZE
        && (t.x * GAMEINFO.TILESIZE)  < (this.camera.xOffset + this.camera.width) * GAMEINFO.TILESIZE
        && (t.y * GAMEINFO.TILESIZE) + GAMEINFO.TILESIZE > this.camera.yOffset * GAMEINFO.TILESIZE
        && (t.y * GAMEINFO.TILESIZE) < (this.camera.yOffset + this.camera.height) * GAMEINFO.TILESIZE) {
        ctx.fillRect(
          (t.x * GAMEINFO.TILESIZE) - (this.camera.xOffset * GAMEINFO.TILESIZE),
          (t.y * GAMEINFO.TILESIZE) - (this.camera.yOffset * GAMEINFO.TILESIZE),
          GAMEINFO.TILESIZE, GAMEINFO.TILESIZE);
      }
    }

  }
}
