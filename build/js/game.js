var Entity = (function () {
    function Entity() {
    }
    return Entity;
}());
var Item = (function () {
    function Item() {
    }
    return Item;
}());
var Cell = (function () {
    function Cell(tileID, entities, items) {
        if (tileID === void 0) { tileID = 0; }
        if (entities === void 0) { entities = []; }
        if (items === void 0) { items = []; }
        this.tileID = tileID;
        this.entities = entities;
        this.items = items;
    }
    return Cell;
}());
var Level = (function () {
    function Level(width, height) {
        this.cells = [];
        this.width = width;
        this.height = height;
        for (var x = 0; x < this.width; x++) {
            for (var y = 0; y < this.height; y++) {
                if (this.cells[x] === undefined)
                    this.cells[x] = [];
                this.cells[x][y] = new Cell();
            }
        }
    }
    Level.prototype.getWidth = function () {
        return this.width;
    };
    Level.prototype.getHeight = function () {
        return this.height;
    };
    return Level;
}());
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
    }
    Game.prototype.init = function () {
        console.log("Initializing...");
        this.level = new Level(10, 10);
        console.log(this.level.cells);
        this.state = "MainMenu";
    };
    Game.prototype.update = function (delta) {
        switch (this.state) {
            case "MainMenu":
                this.state = "Game";
                break;
            case "Game":
                if (this.deltaPaused > 0) {
                    delta -= this.deltaPaused;
                    if (delta < 0)
                        delta = 0;
                    this.deltaPaused = 0;
                }
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
                if (this.clearScreen) {
                    this.ctx.clearRect(0, 0, this.screen.width, this.screen.height);
                    this.ctx.fillStyle = "#bbb";
                    this.ctx.fillRect(0, 360, 640, this.screen.height);
                    this.ctx.fillStyle = "#ddd";
                    this.ctx.fillRect(640, 0, this.screen.height, this.screen.width);
                    this.clearScreen = false;
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
    game.init();
    window.onblur = game.pause.bind(game);
    window.onfocus = game.unpause.bind(game);
    game.run();
};
