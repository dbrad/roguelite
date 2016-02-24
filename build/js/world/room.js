var WALL;
(function (WALL) {
    WALL[WALL["N"] = 0] = "N";
    WALL[WALL["E"] = 1] = "E";
    WALL[WALL["S"] = 2] = "S";
    WALL[WALL["W"] = 3] = "W";
})(WALL || (WALL = {}));
;
var Room = (function () {
    function Room() {
        this.x = 0;
        this.y = 0;
        this.w = 0;
        this.h = 0;
        this.walls = [WALL.N, WALL.E, WALL.S, WALL.W];
        shuffle(this.walls);
    }
    Room.prototype.getRandomWall = function () {
        var randWall = this.walls.pop();
        var x, y;
        if (randWall === WALL.N) {
            x = this.x + Math.floor(this.w / 2);
            y = this.y - 1;
        }
        else if (randWall === WALL.S) {
            x = this.x + Math.floor(this.w / 2);
            y = this.y + this.h;
        }
        else if (randWall === WALL.W) {
            x = this.x - 1;
            y = this.y + Math.floor(this.h / 2);
        }
        else if (randWall === WALL.E) {
            x = this.x + this.w;
            y = this.y + Math.floor(this.h / 2);
        }
        return { x: x, y: y, w: randWall };
    };
    return Room;
}());
