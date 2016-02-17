/// <reference path="./input.ts"/>
interface Context2D extends CanvasRenderingContext2D {
    mozImageSmoothingEnabled?: boolean;
    imageSmoothingEnabled?: boolean;
    webkitImageSmoothingEnabled?: boolean;
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
class Level {
  public redraw: boolean = true;
  public cells: Cell[][];
  private width: number;
  private height: number;

  public camera: Camera;

  private tileSet: TileSet;
  private ItemList: Item[];
  private EntityList: Entity[];

  constructor(width: number, height: number, camera: Camera) {
    this.cells = [];
    this.width = width;
    this.height = height;
    this.camera = camera;

    // Intial Randomization
    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {
        if (this.cells[x] === undefined)
          this.cells[x] = [];
          if ((Math.random() * 100) < 50 || (x === 0 || x === (this.width - 1) || y === 0 || y === (this.height - 1))) {
            this.cells[x][y] = new Cell(0); // Alive (Wall)
          } else {
            this.cells[x][y] = new Cell(1); // Dead (Floor)
          }
      }
    }
    // Striping
    for (let x = 5; x < this.width - 5; x++) {
        this.cells[x][(this.height / 2) - 1].tileID = 1;
        this.cells[x][(this.height / 2)].tileID = 1;
        this.cells[x][(this.height / 2) + 1].tileID = 1;
    }
    for (let y = 5; y < this.width - 5; y++) {
        this.cells[(this.height / 2) - 1][y].tileID = 1;
        this.cells[(this.height / 2)][y].tileID = 1;
        this.cells[(this.height / 2) + 1][y].tileID = 1;
    }

    // Cellular Automata runs
    this.cellularAutomata([5, 6, 7, 8], [4, 5, 6, 7, 8]);
    this.cellularAutomata([5, 6, 7, 8], [4, 5, 6, 7, 8]);
    this.cellularAutomata([5, 6, 7, 8], [4, 5, 6, 7, 8]);
    this.cellularAutomata([5, 6, 7, 8], [4, 5, 6, 7, 8]);
    this.cellularAutomata([5, 6, 7, 8], [4, 5, 6, 7, 8]);

    // lone pixel killing / smoothing
    for (let x = 1; x < this.width - 1; x++) {
      for (let y = 1; y < this.height - 1; y++) {
        let tCell = this.cells[x][y];
        let liveN = this.getLiveNeighbors(x, y);
        if (tCell.tileID === 0 && liveN < 2) { // if wall
          tCell.tileID = 1;
        } else if (tCell.tileID === 1 && liveN === 8) { // if wall
          tCell.tileID = 0;
        }
      }
    }

    let mx = (this.width / 2);
    let my = (this.height / 2);
    while (this.cells[mx][my].tileID !== 1) { mx++; }
    this.floodFill(mx, my, 1, 2);
    for (let x = 1; x < this.width - 1; x++) {
      for (let y = 1; y < this.height - 1; y++) {
        if (this.cells[x][y].tileID === 1) {
          this.cells[x][y].tileID = 0;
        }
      }
    }
  }

  private floodFill(x: number, y: number, target: number, fill: number) {
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

  private getLiveNeighbors(x: number, y: number) {
      let count: number = 0;
      for (let nx = x - 1; nx <= x + 1; nx++) {
        if (nx < 0 || nx > this.width)
          continue;
        for (let ny = y - 1; ny <= y + 1; ny++) {
          if (ny < 0 || ny > this.height)
            continue;
            if (!(nx === x && ny === y)) {
              count += this.cells[nx][ny].tileID; // + 0 if alive, + 1 is dead
            }
        }
      }
    return 8 - count; // 8 - deads (1s) = number of alive
  }

  private cellularAutomata(B: number[], S: number[]) {
    for (let x = 1; x < this.width - 1; x++) {
      for (let y = 1; y < this.height - 1; y++) {
        let tCell = this.cells[x][y];
        let liveN = this.getLiveNeighbors(x, y);
        if (tCell.tileID === 1) { // if Dead
          for ( let n in B ) {
            if (liveN === B[n]) {
              tCell.tileID = 0; // Alive (Wall)
              break;
            }
          }
        } else { // if alive
          tCell.tileID = 1; // Dead (Floor)
          for ( let n in S ) {
            if (liveN === S[n]) { // if it meet survival conditions, bring it back
              tCell.tileID = 0; // Alive (Wall)
              break;
            }
          }
        }
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
namespace GAMEINFO {
  export const GAMESCREEN_TILE_WIDTH = 80;
  export const GAMESCREEN_TILE_HEIGHT = 45;
}
class Game {
    private _loopHandle: number;
    private ctx: Context2D;
    private screen: HTMLCanvasElement;

    public level: Level;

    constructor(screen: HTMLCanvasElement) {
        console.log("Setting up screen");

        /** Hook our game up to our canvas "Screen" */
        this.screen = screen;
        this.ctx = <Context2D>screen.getContext("2d");
        this.ctx.mozImageSmoothingEnabled = false;
        this.ctx.imageSmoothingEnabled = false;
    }

    init(): void {
        console.log("Initializing...");
        /** Initalize Player and World */
        this.level = new Level(100, 100, new Camera(GAMEINFO.GAMESCREEN_TILE_WIDTH, GAMEINFO.GAMESCREEN_TILE_HEIGHT));
        console.log(this.level.cells);
        this.state = "MainMenu";
    }

    /** Update */
    private state: string;
    update(delta: number): void {
        switch (this.state) {
            case "MainMenu":
                this.state = "Game";
                break;
            case "Game":
                // Pause delta handling

                if (this.deltaPaused > 0) {
                    delta -= this.deltaPaused;
                    if (delta < 0) delta = 0;
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
    }

    /** Draw */
    change: boolean = true;
    redraw: boolean = true;
    clearScreen: boolean = true;
    draw(): void {
        switch (this.state) {
            case "MainMenu":
                break;
            case "Game":
                if (this.clearScreen) {
                    this.ctx.clearRect(0, 0, this.screen.width, this.screen.height);
                    this.ctx.fillStyle = "#bbb";
                    this.ctx.fillRect(0, 360, 640, this.screen.height);
                    this.ctx.fillStyle = "#ddd";
                    this.ctx.fillRect(640, 0, this.screen.height, this.screen.width);
                    this.clearScreen = false;
                }
                if (this.level.redraw) {
                  this.ctx.clearRect(0, 0, GAMEINFO.GAMESCREEN_TILE_WIDTH * 8, GAMEINFO.GAMESCREEN_TILE_HEIGHT * 8);
                  this.level.draw(this.ctx);
                  this.level.redraw = false;
                }
                // draw
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
    }

    /** Render/Main Game Loop */
    private then: number = performance.now();
    render(): void {
        let now: number = performance.now();
        let delta = (now - this.then);
        this.then = now;
        this.update(delta);
        this.draw();
        this._loopHandle = window.requestAnimationFrame(this.render.bind(this));
    }

    /** Start and Stop */
    run(): void {
        console.log("Game running");
        this._loopHandle = window.requestAnimationFrame(this.render.bind(this));
    }
    stop(): void {
        console.log("Game stopped");
        window.cancelAnimationFrame(this._loopHandle);
    }


    private timePaused: number = 0;
    private deltaPaused: number = 0;
    pause(): void {
        if (this.state === "Game") {
            this.state = "GamePause";
            this.change = true;
            this.timePaused = performance.now();
        }
    }
    unpause(): void {
        if (this.state === "GamePause") {
            this.state = "Game";
            this.change = this.clearScreen = true;
            this.deltaPaused = performance.now() - this.timePaused;
            this.timePaused = 0;
            this.level.redraw = true;
        }
    }
}

function onResize() {
    let canvas: HTMLCanvasElement = <HTMLCanvasElement>document.getElementById("gameCanvas");
    let scaleX: number = window.innerWidth / canvas.width;
    let scaleY: number = window.innerHeight / canvas.height;
    let scaleToFit: number = Math.min(scaleX, scaleY) | 0;
    scaleToFit = (scaleToFit <= 0) ? 1 : scaleToFit;
    let size: number[] = [canvas.width * scaleToFit, canvas.height * scaleToFit];

    let offset: number[] = this.offset = [(window.innerWidth - size[0]) / 2, (window.innerHeight - size[1]) / 2];

    let stage: HTMLCanvasElement = <HTMLCanvasElement>document.getElementById("stage");
    let rule: string = "translate(" + offset[0] + "px, " + offset[1] + "px) scale(" + scaleToFit + ")";
    stage.style.transform = rule;
    stage.style.webkitTransform = rule;
}

window.onload = () => {
    onResize();
    window.addEventListener("resize", onResize, false);
    window.onkeydown = Input.KB.keyDown;
    window.onkeyup = Input.KB.keyUp;

    let game = new Game(<HTMLCanvasElement>document.getElementById("gameCanvas"));
    game.init();
    window.onblur = game.pause.bind(game);
    window.onfocus = game.unpause.bind(game);
    game.run();
    // ImageCache.Loader.add("sheet", "sheet.png");
    // ImageCache.Loader.load(function() {
    //     game.init();
    //     window.onblur = game.pause.bind(game);
    //     window.onfocus = game.unpause.bind(game);
    //     game.run();
    // })
};
