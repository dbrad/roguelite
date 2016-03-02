namespace TextLog {
    let LogHistory: string[] = [];
    let bottomIndex = 0;

    export function AddLog(log: string) {
        LogHistory[LogHistory.length] = log;
        if (LogHistory.length >= 5) bottomIndex++;
    }
    export function DrawLog(ctx: Context2D) {
        ctx.fillStyle = "#ffffff";
        ctx.font = "12px Monospace";
        for (let i = LogHistory.length - 1; i >= 0 && i >= LogHistory.length - 5; i--) {
            ctx.fillText(LogHistory[i], 2, GAMEINFO.GAME_PIXEL_HEIGHT - (12 * (LogHistory.length - 1 - i)) - 4);
        }
    }
}
