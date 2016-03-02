class World {
    private levelHistory: Level[] = []
    private currentLevel: Level;
    public redraw: boolean = true;
    constructor() {
        this.levelHistory[length] = this.currentLevel = new Dungeon(160, 160, new Camera(GAMEINFO.GAMESCREEN_TILE_WIDTH, GAMEINFO.GAMESCREEN_TILE_HEIGHT));
        let player = this.currentLevel.EntityList.find(function(e: ECS.Entity, i: number, arr: ECS.Entity[]) { return (e["player"]); });
        ECS.Systems.Vision(player, this.currentLevel);
        this.currentLevel.camera.xOffset = this.currentLevel.entrance.x - (this.currentLevel.camera.width / 2);
        this.currentLevel.camera.yOffset = this.currentLevel.entrance.y - (this.currentLevel.camera.height / 2);
        this.currentLevel.snapCameraToLevel();
    }
    update(delta: number) {
        this.currentLevel.redraw = this.redraw;
        this.currentLevel.update(delta);
        this.redraw = this.currentLevel.redraw;
    }
    draw(ctx: Context2D) {
        if (this.currentLevel.redraw) {
            // draw (and maybe re-render) the level, move this to a world class?
            ctx.fillStyle = "#ffffff";
            this.currentLevel.draw(ctx);

            // place holder for textlog
            ctx.fillStyle = "#111111";
            ctx.fillRect(0, GAMEINFO.GAMESCREEN_TILE_HEIGHT * GAMEINFO.TILESIZE, GAMEINFO.TEXTLOG_TILE_WIDTH * GAMEINFO.TILESIZE, GAMEINFO.GAME_PIXEL_HEIGHT);
            TextLog.DrawLog(ctx);

            // place holder for sidebar
            ctx.fillStyle = "#111111";
            ctx.fillRect(GAMEINFO.GAMESCREEN_TILE_WIDTH * GAMEINFO.TILESIZE, 0, GAMEINFO.GAME_PIXEL_WIDTH, GAMEINFO.GAME_PIXEL_HEIGHT);

            ctx.fillStyle = "#ffffff";
            // draw the minimap, also move this to a world class?
            this.currentLevel.drawMiniMap(ctx);

            // draw the entities, also move this to a world class?
            this.currentLevel.drawEntities(ctx);



            this.currentLevel.redraw = false;
        }
    }
}
