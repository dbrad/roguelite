namespace ECS {
    let camThresh: number = 12;
    export namespace Systems {
        export function InputControl(e: Entity, level: Level): boolean {
            let entityPosition: Point = e["pos"].value;
            let movementTaken = false;

            if (Input.KB.wasDown(Input.KB.KEY.LEFT)) {
                e["movement"].value.x = -1;

                movementTaken = true;
            } else if (Input.KB.wasDown(Input.KB.KEY.RIGHT)) {
                e["movement"].value.x = 1;

                movementTaken = true;
            } else if (Input.KB.wasDown(Input.KB.KEY.UP)) {
                e["movement"].value.y = -1;

                movementTaken = true;
            } else if (Input.KB.wasDown(Input.KB.KEY.DOWN)) {
                e["movement"].value.y = 1;
                movementTaken = true;
            }
            if (movementTaken && e["audio-move"]) {
                Input.KB.clearInputQueue();
                (<AudioPool>e["audio-move"].value).play();
            }
            return movementTaken;
        }
        export function Collision(e: Entity, level: Level) {
            if (level.cells[e["pos"].value.x + e["movement"].value.x][e["pos"].value.y + e["movement"].value.y].tileID === 4) {
                e["movement"].value.y = e["movement"].value.x = 0;
            }
        }
        export function Movement(e: Entity, level: Level) {
            e["pos"].value.y += e["movement"].value.y;
            e["pos"].value.x += e["movement"].value.x;
            e["movement"].value.y = e["movement"].value.x = 0;
            e["timer"].value = 0;
        }
        export function Vision(player: Entity, level: Level) {
            for (let c of level.visableCells) {
                level.cells[c.x][c.y].visable = false;
            }
            level.visableCells = [];
            let playerPos: Point = player["pos"].value;
            let dx: number, dy: number;

            let VisionPts: Point[] = [];
            let visableCells: Cell[] = [];
            let torchStr = player["torch"].value;
            for (let d = -torchStr; d <= torchStr; d += 1) {
                VisionPts[VisionPts.length] = new Point(d, -torchStr);
                VisionPts[VisionPts.length] = new Point(d, torchStr);
                VisionPts[VisionPts.length] = new Point(-torchStr, d);
                VisionPts[VisionPts.length] = new Point(torchStr, d);
            }
            let steps: number = 0, incX: number = 0, incY: number = 0;

            let px: number = round((playerPos.x + 0.5) * GAMEINFO.TILESIZE, 2),
                py: number = round((playerPos.y + 0.5) * GAMEINFO.TILESIZE, 2);
            for (let pt of VisionPts) {
                let vx: number = px, vy: number = py;

                dx = round((pt.x) * GAMEINFO.TILESIZE, 2);
                dy = round((pt.y) * GAMEINFO.TILESIZE, 2);

                if (Math.abs(dx) > Math.abs(dy)) {
                    steps = Math.abs(dx);
                } else {
                    steps = Math.abs(dy);
                }

                incX = round(dx / steps, 2);
                incY = round(dy / steps, 2);

                if (incX < 0 && incY > 0) {
                    vy -= 1;
                } else if (incX > 0 && incY < 0) {
                    vx -= 1;
                }
                let tx: number = 0, ty: number = 0;
                for (let v = 0; v < steps; v++) {
                    vx = round((vx + incX), 2);
                    vy = round((vy + incY), 2);

                    tx = Math.floor(vx / GAMEINFO.TILESIZE);
                    ty = Math.floor(vy / GAMEINFO.TILESIZE);

                    if (level.cells[tx] && level.cells[tx][ty]) {
                        if (!level.cells[tx][ty].discovered) {
                            level.cells[tx][ty].discovered = true;
                            level.render_m = level.render_mm = true;
                        }

                        if (!level.cells[tx][ty].visable) {
                            level.cells[tx][ty].visable = true;
                            level.visableCells[level.visableCells.length] = new Point(tx, ty);
                        }
                        if (level.cells[tx][ty].tileID === 3 || level.cells[tx][ty].tileID === 4) {
                            break;
                        }
                    }
                }
            }
        }
        export function LockedCameraControl(camera: Camera, e: Entity) {
            let ex: number = e["pos"].value.x + e["movement"].value.x;
            let ey: number = e["pos"].value.y + e["movement"].value.y;
            if (ex < camera.xOffset + camThresh
                || ex >= camera.xOffset + camera.width - camThresh) {
                camera.xOffset += e["movement"].value.x;
            }
            if (ey < camera.yOffset + (camThresh / 2)
                || ey >= camera.yOffset + camera.height - (camThresh / 2)) {
                camera.yOffset += e["movement"].value.y;
            }

        }
        export function FreeCameraControl(camera: Camera) {
            if (Input.KB.isDown(Input.KB.KEY.LEFT)) {
                camera.xOffset += -1;
            } else if (Input.KB.isDown(Input.KB.KEY.RIGHT)) {
                camera.xOffset += 1;
            } else if (Input.KB.isDown(Input.KB.KEY.UP)) {
                camera.yOffset += -1;
            } else if (Input.KB.isDown(Input.KB.KEY.DOWN)) {
                camera.yOffset += 1;
            }
        }
        export function AIControl(e: Entity, level: Level, player: Entity) {
            let dx: number = 0, dy: number = 0, mx: number = 0, my: number = 0;
            dx = e["pos"].value.x - player["pos"].value.x;
            dy = e["pos"].value.y - player["pos"].value.y;

            if (Math.abs(dx) <= 6 && Math.abs(dy) <= 6) {
                if (Math.abs(dx) > Math.abs(dy)) {
                    if (e["pos"].value.x < player["pos"].value.x) {
                        mx = 1;
                    } else if (e["pos"].value.x > player["pos"].value.x) {
                        mx = -1;
                    }
                } else {
                    if (e["pos"].value.y < player["pos"].value.y) {
                        my = 1;
                    } else if (e["pos"].value.y > player["pos"].value.y) {
                        my = -1;
                    }
                }

            } else {
                if (randomInt(0, 1) === 0) {
                    mx = 1;
                } else {
                    my = -1;
                }
                if (randomInt(0, 1) === 0) {
                    mx *= -1;
                    my *= -1;
                }
            }
            if (level.walkable(level.cells[e["pos"].value.x + mx][e["pos"].value.y + my])) {
                e["movement"].value.x += mx;
                e["movement"].value.y += my;
            }
        }
        export function StubCombat(e: Entity, level: Level, player: Entity) {
            if (e["pos"].value.x === player["pos"].value.x
                && e["pos"].value.y === player["pos"].value.y
                && !e["player"]
                && e["alive"].value === true) {
                e["alive"].value = false;
                if (e["audio-death"]) {
                    e["audio-death"].value.play();
                }
                TextLog.AddLog(e["name"].value + " got gatted!");
            }
        }
    }
}
