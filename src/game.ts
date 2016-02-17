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

    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {
        if (this.cells[x] === undefined)
          this.cells[x] = [];
          this.cells[x][y] = new Cell((x + y) % 3);
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
    if (Input.KB.wasDown(Input.KB.KEY.LEFT)) {
      this.camera.xOffset += 1;
      this.redraw = true;
    } else if (Input.KB.wasDown(Input.KB.KEY.RIGHT)) {
      this.camera.xOffset -= 1;
      this.redraw = true;
    }

    if (Input.KB.wasDown(Input.KB.KEY.UP)) {
      this.camera.yOffset += 1;
      this.redraw = true;
    } else if (Input.KB.wasDown(Input.KB.KEY.DOWN)) {
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
            case 0:
              ctx.fillStyle = "#F00";
              break;
            case 1:
              ctx.fillStyle = "#FF0";
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
        this.level = new Level(20, 20, new Camera(GAMEINFO.GAMESCREEN_TILE_WIDTH, GAMEINFO.GAMESCREEN_TILE_HEIGHT));
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
