namespace GAMEINFO {
    export const TILESIZE: number = 16;
    export const GAME_PIXEL_WIDTH: number = 800;
    export const GAME_PIXEL_HEIGHT: number = 448;

    export const GAME_TILE_WIDTH: number = GAME_PIXEL_WIDTH / TILESIZE;
    export const GAME_TILE_HEIGHT: number = GAME_PIXEL_HEIGHT / TILESIZE;

    export const TEXTLOG_TILE_HEIGHT: number = 6;

    export const GAMESCREEN_TILE_WIDTH: number = GAME_TILE_WIDTH * .8;
    export const GAMESCREEN_TILE_HEIGHT: number = GAME_TILE_HEIGHT - TEXTLOG_TILE_HEIGHT;

    export const SIDEBAR_TILE_WIDTH: number = GAME_TILE_WIDTH - GAMESCREEN_TILE_WIDTH;
    export const SIDEBAR_TILE_HEIGHT: number = GAME_TILE_HEIGHT;

    export const TEXTLOG_TILE_WIDTH: number = GAME_TILE_WIDTH - SIDEBAR_TILE_WIDTH;
}
