/// <reference path="./input.ts"/>
/// <reference path="./game_objs.ts"/>
/// <reference path="./cave.ts"/>
/// <reference path="./dungeon.ts"/>

interface Context2D extends CanvasRenderingContext2D {
    mozImageSmoothingEnabled?: boolean;
    imageSmoothingEnabled?: boolean;
    webkitImageSmoothingEnabled?: boolean;
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
        this.level = new Dungeon(200, 200, new Camera(GAMEINFO.GAMESCREEN_TILE_WIDTH, GAMEINFO.GAMESCREEN_TILE_HEIGHT));
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
