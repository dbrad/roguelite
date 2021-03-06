var Game = (function () {
    function Game(screen) {
        this.change = true;
        this.redraw = true;
        this.clearScreen = true;
        this.then = performance.now();
        this.timePaused = 0;
        this.deltaPaused = 0;
        console.log("Setting up screen");
        this.screen = screen;
        this.ctx = screen.getContext("2d");
        this.ctx.mozImageSmoothingEnabled = false;
        this.ctx.imageSmoothingEnabled = false;
        this.buffer = document.createElement("canvas");
        this.buffer.width = GAMEINFO.GAME_PIXEL_WIDTH;
        this.buffer.height = GAMEINFO.GAME_PIXEL_HEIGHT;
        this.bufferCtx = this.buffer.getContext("2d");
        this.bufferCtx.mozImageSmoothingEnabled = false;
        this.bufferCtx.imageSmoothingEnabled = false;
    }
    Game.prototype.init = function () {
        console.log("Initializing...");
        SpriteSheetCache.storeSheet(new SpriteSheet("sheet", "tiles", 16, 0, new Dimension(7, 1)));
        SpriteSheetCache.storeSheet(new SpriteSheet("sheet", "entities", 16, 0, new Dimension(3, 1), new Point(0, 16)));
        SpriteSheetCache.spriteSheet("entities").reColourize(0, 245, 200, 25);
        SpriteSheetCache.spriteSheet("entities").reColourize(1, 150, 150, 150);
        SpriteSheetCache.spriteSheet("entities").reColourize(2, 200, 1, 1);
        SpriteSheetCache.spriteSheet("tiles").reColourize(4, 50, 50, 50);
        SpriteSheetCache.spriteSheet("tiles").reColourize(3, 140, 100, 60);
        SpriteSheetCache.spriteSheet("tiles").reColourize(2, 25, 25, 25);
        this.world = new World();
        this.state = "MainMenu";
        TextLog.AddLog("Arrow keys to move.");
    };
    Game.prototype.update = function (delta) {
        switch (this.state) {
            case "MainMenu":
                this.state = "Game";
                break;
            case "Game":
                if (this.deltaPaused > 0) {
                    delta -= this.deltaPaused;
                    if (delta < 0) {
                        delta = 0;
                    }
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
    };
    Game.prototype.draw = function () {
        switch (this.state) {
            case "MainMenu":
                break;
            case "Game":
                if (this.clearScreen || this.world.redraw) {
                    this.ctx.clearRect(0, 0, this.screen.width, this.screen.height);
                    this.bufferCtx.clearRect(0, 0, this.screen.width, this.screen.height);
                    this.clearScreen = false;
                }
                if (this.world.redraw) {
                    this.world.draw(this.bufferCtx);
                    this.ctx.fillStyle = "#ffffff";
                    this.ctx.drawImage(this.buffer, 0, 0, GAMEINFO.GAME_PIXEL_WIDTH, GAMEINFO.GAME_PIXEL_HEIGHT, 0, 0, GAMEINFO.GAME_PIXEL_WIDTH, GAMEINFO.GAME_PIXEL_HEIGHT);
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
    };
    Game.prototype.render = function () {
        var now = performance.now();
        var delta = (now - this.then);
        this.then = now;
        this.update(delta);
        this.draw();
        this._loopHandle = window.requestAnimationFrame(this.render.bind(this));
    };
    Game.prototype.run = function () {
        console.log("Game running");
        this._loopHandle = window.requestAnimationFrame(this.render.bind(this));
    };
    Game.prototype.stop = function () {
        console.log("Game stopped");
        window.cancelAnimationFrame(this._loopHandle);
    };
    Game.prototype.pause = function () {
        if (this.state === "Game") {
            this.state = "GamePause";
            this.change = true;
            this.timePaused = performance.now();
        }
    };
    Game.prototype.unpause = function () {
        if (this.state === "GamePause") {
            this.state = "Game";
            this.change = this.clearScreen = true;
            this.deltaPaused = performance.now() - this.timePaused;
            this.timePaused = 0;
            this.world.redraw = true;
        }
    };
    return Game;
}());
function onResize() {
    var canvas = document.getElementById("gameCanvas");
    var scaleX = window.innerWidth / canvas.width;
    var scaleY = window.innerHeight / canvas.height;
    var scaleToFit = Math.min(scaleX, scaleY) | 0;
    scaleToFit = (scaleToFit <= 0) ? 1 : scaleToFit;
    var size = [canvas.width * scaleToFit, canvas.height * scaleToFit];
    var offset = this.offset = [(window.innerWidth - size[0]) / 2, (window.innerHeight - size[1]) / 2];
    var stage = document.getElementById("stage");
    var rule = "translate(" + offset[0] + "px, " + offset[1] + "px) scale(" + scaleToFit + ")";
    stage.style.transform = rule;
    stage.style.webkitTransform = rule;
}
window.onload = function () {
    onResize();
    window.addEventListener("resize", onResize, false);
    window.onkeydown = Input.KB.keyDown;
    window.onkeyup = Input.KB.keyUp;
    var game = new Game(document.getElementById("gameCanvas"));
    ImageCache.Loader.add("sheet", "sheet1.png");
    ImageCache.Loader.load(function () {
        game.init();
        window.onblur = game.pause.bind(game);
        window.onfocus = game.unpause.bind(game);
        game.run();
    });
};
