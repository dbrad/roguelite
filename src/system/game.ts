/// <reference path="./input.ts"/>
/// <reference path="./camera.ts"/>
/// <reference path="./game_config.ts"/>

/// <reference path="../types/types.ts"/>
/// <reference path="../util/utility.ts"/>

/// <reference path="../ecs/components.ts"/>
/// <reference path="../ecs/entity.ts"/>

/// <reference path="../world/level.ts"/>
/// <reference path="../world/dungeon.ts"/>

class Game {
    private _loopHandle: number;

    private screen: HTMLCanvasElement;
    private buffer: HTMLCanvasElement;

    private ctx: Context2D;
    private bufferCtx: Context2D;

    public world: World;

    constructor(screen: HTMLCanvasElement) {
        console.log("Setting up screen");
        // Hook our game up to our canvas "Screen"
        this.screen = screen;
        this.ctx = <Context2D>screen.getContext("2d");
        this.ctx.mozImageSmoothingEnabled = false;
        this.ctx.imageSmoothingEnabled = false;

        this.buffer = document.createElement("canvas");
        this.buffer.width = GAMEINFO.GAME_PIXEL_WIDTH;
        this.buffer.height = GAMEINFO.GAME_PIXEL_HEIGHT;

        this.bufferCtx = <Context2D>this.buffer.getContext("2d");
        this.bufferCtx.mozImageSmoothingEnabled = false;
        this.bufferCtx.imageSmoothingEnabled = false;
    }

    init(): void {
        console.log("Initializing...");

        SpriteSheetCache.storeSheet(new SpriteSheet("sheet", "tiles", 16, 0, new Dimension(7, 1)));
        SpriteSheetCache.storeSheet(new SpriteSheet("sheet", "entities", 16, 0, new Dimension(3, 1), new Point(0, 16)));

        SpriteSheetCache.spriteSheet("entities").reColourize(0, 245, 200, 25);
        SpriteSheetCache.spriteSheet("entities").reColourize(1, 150, 150, 150);
        SpriteSheetCache.spriteSheet("entities").reColourize(2, 200, 1, 1);

        SpriteSheetCache.spriteSheet("tiles").reColourize(4, 50, 50, 50);
        SpriteSheetCache.spriteSheet("tiles").reColourize(3, 140, 100, 60);
        SpriteSheetCache.spriteSheet("tiles").reColourize(2, 25, 25, 25);
        // most of this will move to the world class
        // will load a saved world or make a new world from main menu
        this.world = new World();

        this.state = "MainMenu";
        TextLog.AddLog("Arrow keys to move.");
    }

    /** Update */
    private state: string;
    update(delta: number): void {
        switch (this.state) {
            case "MainMenu":
                // this.mainmenu.update();
                this.state = "Game";
                break;
            case "Game":
                // Pause delta handling
                if (this.deltaPaused > 0) {
                    delta -= this.deltaPaused;
                    if (delta < 0) { delta = 0; }
                    this.deltaPaused = 0;
                }
                this.world.update(delta);
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
                // this.mainmenu.draw();
                break;
            case "Game":
                if (this.clearScreen || this.world.redraw) {
                    this.ctx.clearRect(0, 0, this.screen.width, this.screen.height);
                    this.bufferCtx.clearRect(0, 0, this.screen.width, this.screen.height);
                    this.clearScreen = false;
                }

                /**
                 * most likely create a world class
                 * use a "this.world.draw(this.bufferctx);" instead of indivdual calls here.
                 * this manager will likely keep a history of live levels for backtracking and such
                 */
                if (this.world.redraw) {
                    this.world.draw(this.bufferCtx);
                    this.ctx.fillStyle = "#ffffff";
                    this.ctx.drawImage(
                        this.buffer,
                        0, 0, GAMEINFO.GAME_PIXEL_WIDTH, GAMEINFO.GAME_PIXEL_HEIGHT,
                        0, 0, GAMEINFO.GAME_PIXEL_WIDTH, GAMEINFO.GAME_PIXEL_HEIGHT);
                    this.world.redraw = false;
                }

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
            this.world.redraw = true;
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

window.onload = function() {
    onResize();
    window.addEventListener("resize", onResize, false);
    window.onkeydown = Input.KB.keyDown;
    window.onkeyup = Input.KB.keyUp;

    let game = new Game(<HTMLCanvasElement>document.getElementById("gameCanvas"));
    ImageCache.Loader.add("sheet", "sheet1.png");
    ImageCache.Loader.load(function() {
        game.init();
        window.onblur = game.pause.bind(game);
        window.onfocus = game.unpause.bind(game);
        game.run();
    });
};
