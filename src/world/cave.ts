/// <reference path="../system/game_config.ts"/>
/// <reference path="../system/camera.ts"/>

/// <reference path="./level.ts"/>
/// <reference path="./cell.ts"/>

/// <reference path="../util/utility.ts"/>
/// <reference path="../types/types.ts"/>

class Cave extends Level {

    constructor(width: number, height: number, camera: Camera) {
        super(width, height, camera);

        // Intial Randomization
        for (let x = 0; x < this._width; x++) {
            for (let y = 0; y < this._height; y++) {
                if (this.cells[x] === undefined) {
                    this.cells[x] = [];
                }
                if ((Math.random() * 100) < 50 || (x === 0 || x === (this._width - 1) || y === 0 || y === (this._height - 1))) {
                    this.cells[x][y] = new Cell(0); // Alive (Wall)
                } else {
                    this.cells[x][y] = new Cell(1); // Dead (Floor)
                }
            }
        }
        // Striping
        for (let x = 5; x < this._width - 5; x++) {
            this.cells[x][(this._height / 2) - 1].tileID = 1;
            this.cells[x][(this._height / 2)].tileID = 1;
            this.cells[x][(this._height / 2) + 1].tileID = 1;
        }
        for (let y = 5; y < this._width - 5; y++) {
            this.cells[(this._height / 2) - 1][y].tileID = 1;
            this.cells[(this._height / 2)][y].tileID = 1;
            this.cells[(this._height / 2) + 1][y].tileID = 1;
        }

        // Cellular Automata runs
        this.cellularAutomata([5, 6, 7, 8], [4, 5, 6, 7, 8]);
        this.cellularAutomata([5, 6, 7, 8], [4, 5, 6, 7, 8]);
        this.cellularAutomata([5, 6, 7, 8], [4, 5, 6, 7, 8]);
        this.cellularAutomata([5, 6, 7, 8], [4, 5, 6, 7, 8]);
        this.cellularAutomata([5, 6, 7, 8], [4, 5, 6, 7, 8]);

        // lone pixel killing / smoothing
        for (let x = 1; x < this._width - 1; x++) {
            for (let y = 1; y < this._height - 1; y++) {
                let tCell = this.cells[x][y];
                let liveN = this.getLiveNeighbors(x, y);
                if (tCell.tileID === 0 && liveN < 2) { // if wall
                    tCell.tileID = 1;
                } else if (tCell.tileID === 1 && liveN === 8) { // if wall
                    tCell.tileID = 0;
                }
            }
        }

        let mx = (this._width / 2);
        let my = (this._height / 2);
        while (this.cells[mx][my].tileID !== 1) { mx++; }
        this.floodFill(mx, my, 1, 2);
        for (let x = 1; x < this._width - 1; x++) {
            for (let y = 1; y < this._height - 1; y++) {
                if (this.cells[x][y].tileID === 1) {
                    this.cells[x][y].tileID = 0;
                }
            }
        }
    }

    private getLiveNeighbors(x: number, y: number): number {
        let count: number = 0;
        for (let nx = x - 1; nx <= x + 1; nx++) {
            if (nx < 0 || nx > this._width) {
                continue;
            }
            for (let ny = y - 1; ny <= y + 1; ny++) {
                if (ny < 0 || ny > this._height) {
                    continue;
                }
                if (!(nx === x && ny === y)) {
                    count += this.cells[nx][ny].tileID; // + 0 if alive, + 1 is dead
                }
            }
        }
        return 8 - count; // 8 - deads (1s) = number of alive
    }

    private cellularAutomata(B: number[], S: number[]): void {
        for (let x = 1; x < this._width - 1; x++) {
            for (let y = 1; y < this._height - 1; y++) {
                let tCell = this.cells[x][y];
                let liveN = this.getLiveNeighbors(x, y);
                if (tCell.tileID === 1) { // if Dead
                    for (let n in B) {
                        if (liveN === B[n]) {
                            tCell.tileID = 0; // Alive (Wall)
                            break;
                        }
                    }
                } else { // if alive
                    tCell.tileID = 1; // Dead (Floor)
                    for (let n in S) {
                        if (liveN === S[n]) { // if it meet survival conditions, bring it back
                            tCell.tileID = 0; // Alive (Wall)
                            break;
                        }
                    }
                }
            }
        }
    }
}
