var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Cave = (function (_super) {
    __extends(Cave, _super);
    function Cave(width, height, camera) {
        _super.call(this, width, height, camera);
        for (var x = 0; x < this.width; x++) {
            for (var y = 0; y < this.height; y++) {
                if (this.cells[x] === undefined) {
                    this.cells[x] = [];
                }
                if ((Math.random() * 100) < 50 || (x === 0 || x === (this.width - 1) || y === 0 || y === (this.height - 1))) {
                    this.cells[x][y] = new Cell(0);
                }
                else {
                    this.cells[x][y] = new Cell(1);
                }
            }
        }
        for (var x = 5; x < this.width - 5; x++) {
            this.cells[x][(this.height / 2) - 1].tileID = 1;
            this.cells[x][(this.height / 2)].tileID = 1;
            this.cells[x][(this.height / 2) + 1].tileID = 1;
        }
        for (var y = 5; y < this.width - 5; y++) {
            this.cells[(this.height / 2) - 1][y].tileID = 1;
            this.cells[(this.height / 2)][y].tileID = 1;
            this.cells[(this.height / 2) + 1][y].tileID = 1;
        }
        this.cellularAutomata([5, 6, 7, 8], [4, 5, 6, 7, 8]);
        this.cellularAutomata([5, 6, 7, 8], [4, 5, 6, 7, 8]);
        this.cellularAutomata([5, 6, 7, 8], [4, 5, 6, 7, 8]);
        this.cellularAutomata([5, 6, 7, 8], [4, 5, 6, 7, 8]);
        this.cellularAutomata([5, 6, 7, 8], [4, 5, 6, 7, 8]);
        for (var x = 1; x < this.width - 1; x++) {
            for (var y = 1; y < this.height - 1; y++) {
                var tCell = this.cells[x][y];
                var liveN = this.getLiveNeighbors(x, y);
                if (tCell.tileID === 0 && liveN < 2) {
                    tCell.tileID = 1;
                }
                else if (tCell.tileID === 1 && liveN === 8) {
                    tCell.tileID = 0;
                }
            }
        }
        var mx = (this.width / 2);
        var my = (this.height / 2);
        while (this.cells[mx][my].tileID !== 1) {
            mx++;
        }
        this.floodFill(mx, my, 1, 2);
        for (var x = 1; x < this.width - 1; x++) {
            for (var y = 1; y < this.height - 1; y++) {
                if (this.cells[x][y].tileID === 1) {
                    this.cells[x][y].tileID = 0;
                }
            }
        }
    }
    Cave.prototype.getLiveNeighbors = function (x, y) {
        var count = 0;
        for (var nx = x - 1; nx <= x + 1; nx++) {
            if (nx < 0 || nx > this.width) {
                continue;
            }
            for (var ny = y - 1; ny <= y + 1; ny++) {
                if (ny < 0 || ny > this.height) {
                    continue;
                }
                if (!(nx === x && ny === y)) {
                    count += this.cells[nx][ny].tileID;
                }
            }
        }
        return 8 - count;
    };
    Cave.prototype.cellularAutomata = function (B, S) {
        for (var x = 1; x < this.width - 1; x++) {
            for (var y = 1; y < this.height - 1; y++) {
                var tCell = this.cells[x][y];
                var liveN = this.getLiveNeighbors(x, y);
                if (tCell.tileID === 1) {
                    for (var n in B) {
                        if (liveN === B[n]) {
                            tCell.tileID = 0;
                            break;
                        }
                    }
                }
                else {
                    tCell.tileID = 1;
                    for (var n in S) {
                        if (liveN === S[n]) {
                            tCell.tileID = 0;
                            break;
                        }
                    }
                }
            }
        }
    };
    return Cave;
}(Level));
