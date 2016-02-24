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

    public level: Level;

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
        // most of this will move to the world class
        // will load a saved world or make a new world from main menu
        this.level = new Dungeon(160, 160, new Camera(GAMEINFO.GAMESCREEN_TILE_WIDTH, GAMEINFO.GAMESCREEN_TILE_HEIGHT));
        this.level.floodDiscover(this.level.entrance.x, this.level.entrance.y);
        this.level.camera.xOffset = this.level.entrance.x - (this.level.camera.width / 2);
        this.level.camera.yOffset = this.level.entrance.y - (this.level.camera.height / 2);
        this.level.snapCameraToLevel();
        let player = new ECS.Entity();
        player.addComponent(new ECS.Components.IsPlayer());
        player.addComponent(new ECS.Components.TilePos());

        player["pos"].value.x = this.level.entrance.x;
        player["pos"].value.y = this.level.entrance.y;
        this.level.EntityList.push(player);

        for (let i = 0; i < 20; i++) {
            let enemy = new ECS.Entity();
            enemy.addComponent(new ECS.Components.IsEnemy());
            enemy.addComponent(new ECS.Components.TilePos());
            do {
                enemy["pos"].value.x = randomInt(0, 159);
                enemy["pos"].value.y = randomInt(0, 159);
            } while (this.level.cells[enemy["pos"].value.x][enemy["pos"].value.y].tileID !== 2);
            this.level.EntityList.push(enemy);
        }
        this.state = "MainMenu";
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
                this.level.update(delta);
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
                if (this.clearScreen || this.level.redraw) {
                    this.ctx.clearRect(0, 0, this.screen.width, this.screen.height);
                    this.clearScreen = false;
                }

                /**
                 * most likely create a world class
                 * use a "this.world.draw(this.bufferctx);" instead of indivdual calls here.
                 * this manager will likely keep a history of live levels for backtracking and such
                 */
                if (this.level.redraw) {
                    // draw (and maybe re-render) the level, move this to a world class?
                    this.level.draw(this.bufferCtx);

                    // place holder for textlog
                    this.bufferCtx.fillStyle = "#000000";
                    this.bufferCtx.fillRect(0, GAMEINFO.GAMESCREEN_TILE_HEIGHT * GAMEINFO.TILESIZE, GAMEINFO.TEXTLOG_TILE_WIDTH * GAMEINFO.TILESIZE, this.screen.height);

                    // place holder for sidebar
                    this.bufferCtx.fillStyle = "#000000";
                    this.bufferCtx.fillRect(GAMEINFO.GAMESCREEN_TILE_WIDTH * GAMEINFO.TILESIZE, 0, this.screen.height, this.screen.width);

                    // draw the minimap, also move this to a world class?
                    this.level.drawMiniMap(this.bufferCtx);

                    // draw the entities, also move this to a world class?
                    this.level.drawEntities(this.bufferCtx);

                    // draw the offscreen canvas to the onscreen canvas
                    this.ctx.drawImage(
                        this.buffer,
                        0, 0, GAMEINFO.GAME_PIXEL_WIDTH, GAMEINFO.GAME_PIXEL_HEIGHT,
                        0, 0, GAMEINFO.GAME_PIXEL_WIDTH, GAMEINFO.GAME_PIXEL_HEIGHT);
                    this.level.redraw = false;
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
