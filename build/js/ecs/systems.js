var ECS;
(function (ECS) {
    var camThresh = 12;
    var Systems;
    (function (Systems) {
        function InputControl(e, level) {
            var entityPosition = e["pos"].value;
            var movementTaken = false;
            if (Input.KB.wasDown(Input.KB.KEY.LEFT)) {
                if (level.cells[entityPosition.x - 1][entityPosition.y].tileID !== 4) {
                    entityPosition.x--;
                    if (entityPosition.x < level.camera.xOffset + camThresh) {
                        level.camera.xOffset--;
                        if (level.camera.xOffset <= 0) {
                            level.camera.xOffset = 0;
                        }
                    }
                }
                movementTaken = true;
            }
            else if (Input.KB.wasDown(Input.KB.KEY.RIGHT)) {
                if (level.cells[entityPosition.x + 1][entityPosition.y].tileID !== 4) {
                    entityPosition.x++;
                    if (entityPosition.x >= level.camera.xOffset + level.camera.width - camThresh) {
                        level.camera.xOffset++;
                        if (level.camera.xOffset + level.camera.width >= level.width) {
                            level.camera.xOffset = (level.width - level.camera.width);
                        }
                    }
                }
                movementTaken = true;
            }
            else if (Input.KB.wasDown(Input.KB.KEY.UP)) {
                if (level.cells[entityPosition.x][entityPosition.y - 1].tileID !== 4) {
                    entityPosition.y--;
                    if (entityPosition.y < level.camera.yOffset + (camThresh - 3)) {
                        level.camera.yOffset--;
                        if (level.camera.yOffset <= 0) {
                            level.camera.yOffset = 0;
                        }
                    }
                }
                movementTaken = true;
            }
            else if (Input.KB.wasDown(Input.KB.KEY.DOWN)) {
                if (level.cells[entityPosition.x][entityPosition.y + 1].tileID !== 4) {
                    entityPosition.y++;
                    if (entityPosition.y >= level.camera.yOffset + level.camera.height - (camThresh - 3)) {
                        level.camera.yOffset++;
                        if (level.camera.yOffset + level.camera.height >= level.height) {
                            level.camera.yOffset = (level.height - level.camera.height);
                        }
                    }
                }
                movementTaken = true;
            }
            if (movementTaken && e["audio-move"]) {
                e["audio-move"].value.play();
            }
            return movementTaken;
        }
        Systems.InputControl = InputControl;
        function Vision(player, level) {
            for (var _i = 0, _a = level.visableCells; _i < _a.length; _i++) {
                var c = _a[_i];
                level.cells[c.x][c.y].visable = false;
            }
            level.visableCells = [];
            var playerPos = player["pos"].value;
            var dx, dy;
            var VisionPts = [];
            var visableCells = [];
            var torchStr = player["torch"].value;
            for (var d = -torchStr; d <= torchStr; d += 1) {
                VisionPts[VisionPts.length] = new Point(d, -torchStr);
                VisionPts[VisionPts.length] = new Point(d, torchStr);
                VisionPts[VisionPts.length] = new Point(-torchStr, d);
                VisionPts[VisionPts.length] = new Point(torchStr, d);
            }
            var steps = 0, incX = 0, incY = 0;
            var px = round((playerPos.x + 0.5) * GAMEINFO.TILESIZE, 2), py = round((playerPos.y + 0.5) * GAMEINFO.TILESIZE, 2);
            for (var _b = 0, VisionPts_1 = VisionPts; _b < VisionPts_1.length; _b++) {
                var pt = VisionPts_1[_b];
                var vx = px, vy = py;
                dx = round((pt.x) * GAMEINFO.TILESIZE, 2);
                dy = round((pt.y) * GAMEINFO.TILESIZE, 2);
                if (Math.abs(dx) > Math.abs(dy)) {
                    steps = Math.abs(dx);
                }
                else {
                    steps = Math.abs(dy);
                }
                incX = round(dx / steps, 2);
                incY = round(dy / steps, 2);
                if (incX < 0 && incY > 0) {
                    vy -= 1;
                }
                else if (incX > 0 && incY < 0) {
                    vx -= 1;
                }
                var tx = 0, ty = 0;
                for (var v = 0; v < steps; v++) {
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
        Systems.Vision = Vision;
        function AIControl(e, level, player) {
            var dx = 0, dy = 0, mx = 0, my = 0;
            dx = e["pos"].value.x - player["pos"].value.x;
            dy = e["pos"].value.y - player["pos"].value.y;
            if (Math.abs(dx) <= 6 && Math.abs(dy) <= 6) {
                if (Math.abs(dx) > Math.abs(dy)) {
                    if (e["pos"].value.x < player["pos"].value.x) {
                        mx = 1;
                    }
                    else if (e["pos"].value.x > player["pos"].value.x) {
                        mx = -1;
                    }
                }
                else {
                    if (e["pos"].value.y < player["pos"].value.y) {
                        my = 1;
                    }
                    else if (e["pos"].value.y > player["pos"].value.y) {
                        my = -1;
                    }
                }
            }
            else {
                if (randomInt(0, 1) === 0) {
                    mx = 1;
                }
                else {
                    my = -1;
                }
                if (randomInt(0, 1) === 0) {
                    mx *= -1;
                    my *= -1;
                }
            }
            if (level.walkable(level.cells[e["pos"].value.x + mx][e["pos"].value.y + my])) {
                e["pos"].value.x += mx;
                e["pos"].value.y += my;
            }
        }
        Systems.AIControl = AIControl;
        function StubCombat(e, level, player) {
            if (e["pos"].value.x === player["pos"].value.x
                && e["pos"].value.y === player["pos"].value.y) {
                e["alive"].value = false;
                if (e["audio-death"]) {
                    e["audio-death"].value.play();
                }
                TextLog.AddLog(e["name"].value + " got gatted!");
            }
        }
        Systems.StubCombat = StubCombat;
    })(Systems = ECS.Systems || (ECS.Systems = {}));
})(ECS || (ECS = {}));
