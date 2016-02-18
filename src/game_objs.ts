namespace GAMEINFO {
  export const GAMESCREEN_TILE_WIDTH = 80;
  export const GAMESCREEN_TILE_HEIGHT = 45;
}

class TileSet {}
interface ComponentDictionary {
  [index: string]: Component;
}
class Entity {
  public components: ComponentDictionary;
  constructor() {
    this.components = {};
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
    this.discovered = true;
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
  public cells: Cell[][];
  protected width: number;
  protected height: number;

  public camera: Camera;

  protected tileSet: TileSet;
  protected ItemList: Item[];
  protected EntityList: Entity[];

  constructor(width: number, height: number, camera: Camera) {
    this.cells = [];
    this.width = width;
    this.height = height;
    this.camera = camera;
  }

  protected floodFill(x: number, y: number, target: number, fill: number) {
    let maxX: number = this.width - 1;
    let maxY: number = this.height - 1;
    let stack: number[][] = [];
    let index: number = 0;

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
  }

  getWidth(): number {
    return this.width;
  }

  getHeight(): number {
    return this.height;
  }

  update(): void {
    if (Input.KB.isDown(Input.KB.KEY.LEFT)) {
      this.camera.xOffset += 1;
      this.redraw = true;
    } else if (Input.KB.isDown(Input.KB.KEY.RIGHT)) {
      this.camera.xOffset -= 1;
      this.redraw = true;
    }

    if (Input.KB.isDown(Input.KB.KEY.UP)) {
      this.camera.yOffset += 1;
      this.redraw = true;
    } else if (Input.KB.isDown(Input.KB.KEY.DOWN)) {
      this.camera.yOffset -= 1;
      this.redraw = true;
    }
  }

  draw(ctx: Context2D): void {
    for (let tx = this.camera.xOffset, x = 0; tx < this.camera.xOffset + this.camera.width; tx++) {
      for (let ty =  this.camera.yOffset, y = 0; ty < this.camera.yOffset + this.camera.height; ty++) {
        if (!this.cells[tx]) {
          ctx.fillStyle = "#000";
          ctx.fillRect(x * 8, y * 8, 8, 8);
          y++;
          continue;
        }
        if (!this.cells[tx][ty]) {
          ctx.fillStyle = "#000";
          ctx.fillRect(x * 8, y * 8, 8, 8);
          y++;
          continue;
        }

        let tCell = this.cells[tx][ty];
        if (!tCell.discovered) {
          ctx.fillStyle = "black";
          ctx.fillRect(x * 8, y * 8, 8, 8);
        } else if (!tCell.visable) {
          ctx.fillStyle = "#bbb";
          ctx.fillRect(x * 8, y * 8, 8, 8);
        } else {
          switch (tCell.tileID) {
            case 0: // Wall
              ctx.fillStyle = "#000";
              break;
            case 1:
              ctx.fillStyle = "#AAA";
              break;
            case 2:
              ctx.fillStyle = "#0FF";
              break;
            default:
              ctx.fillStyle = "#FFF";
            break;
          }
          ctx.fillRect(x * 8, y * 8, 8, 8);
        }
        y++;
      }
      x++;
    }
  }
}
