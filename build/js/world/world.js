var World = (function () {
    function World() {
        this.levelHistory = [];
        this.redraw = true;
        this.levelHistory[length] = this.currentLevel = new Dungeon(160, 160, new Camera(GAMEINFO.GAMESCREEN_TILE_WIDTH, GAMEINFO.GAMESCREEN_TILE_HEIGHT));
        var player = this.currentLevel.EntityList.find(function (e, i, arr) { return (e["player"]); });
        ECS.Systems.Vision(player, this.currentLevel);
        this.currentLevel.camera.xOffset = this.currentLevel.entrance.x - (this.currentLevel.camera.width / 2);
        this.currentLevel.camera.yOffset = this.currentLevel.entrance.y - (this.currentLevel.camera.height / 2);
        this.currentLevel.snapCameraToLevel();
    }
    World.prototype.update = function (delta) {
        this.currentLevel.redraw = this.redraw;
        this.currentLevel.update(delta);
        this.redraw = this.currentLevel.redraw;
    };
    World.prototype.draw = function (ctx) {
        if (this.currentLevel.redraw) {
            ctx.fillStyle = "#ffffff";
            this.currentLevel.draw(ctx);
            ctx.fillStyle = "#111111";
            ctx.fillRect(0, GAMEINFO.GAMESCREEN_TILE_HEIGHT * GAMEINFO.TILESIZE, GAMEINFO.TEXTLOG_TILE_WIDTH * GAMEINFO.TILESIZE, GAMEINFO.GAME_PIXEL_HEIGHT);
            TextLog.DrawLog(ctx);
            ctx.fillStyle = "#111111";
            ctx.fillRect(GAMEINFO.GAMESCREEN_TILE_WIDTH * GAMEINFO.TILESIZE, 0, GAMEINFO.GAME_PIXEL_WIDTH, GAMEINFO.GAME_PIXEL_HEIGHT);
            ctx.fillStyle = "#ffffff";
            this.currentLevel.drawMiniMap(ctx);
            this.currentLevel.drawEntities(ctx);
            this.currentLevel.redraw = false;
        }
    };
    return World;
}());
