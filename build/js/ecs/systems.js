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
            return movementTaken;
        }
        Systems.InputControl = InputControl;
        function AIControl(e, level, player) {
        }
        Systems.AIControl = AIControl;
    })(Systems = ECS.Systems || (ECS.Systems = {}));
})(ECS || (ECS = {}));
