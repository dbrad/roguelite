/// <reference path="../system/input.ts"/>

namespace ECS {
    let camThresh: number = 12;
    export namespace Systems {
        export function InputControl(e: Entity, level: Level): boolean {
            let entityPosition: Point = e["pos"].value;
            let movementTaken = false;

            // if (Input.KB.isDown(Input.KB.KEY.NUM_1)) {
            // 	e["torch"].value = 1;
            // 	level.redraw = true;
            // } else if (Input.KB.isDown(Input.KB.KEY.NUM_2)) {
            // 	e["torch"].value = 2;
            // 	level.redraw = true;
            // } else if (Input.KB.isDown(Input.KB.KEY.NUM_3)) {
            // 	e["torch"].value = 3;
            // 	level.redraw = true;
            // } else if (Input.KB.isDown(Input.KB.KEY.NUM_4)) {
            // 	e["torch"].value = 4;
            // 	level.redraw = true;
            // } else if (Input.KB.isDown(Input.KB.KEY.NUM_5)) {
            // 	e["torch"].value = 5;
            // 	level.redraw = true;
            // }

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
            } else if (Input.KB.wasDown(Input.KB.KEY.RIGHT)) {

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
            } else if (Input.KB.wasDown(Input.KB.KEY.UP)) {

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
            } else if (Input.KB.wasDown(Input.KB.KEY.DOWN)) {

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
        export function AIControl(e: Entity, level: Level, player: Entity) {

        }
    }
}
