var TextLog;
(function (TextLog) {
    var LogHistory = [];
    var bottomIndex = 0;
    function AddLog(log) {
        LogHistory[LogHistory.length] = log;
        if (LogHistory.length >= 5)
            bottomIndex++;
    }
    TextLog.AddLog = AddLog;
    function DrawLog(ctx) {
        ctx.fillStyle = "#ffffff";
        ctx.font = "12px Monospace";
        for (var i = LogHistory.length - 1; i >= 0 && i >= LogHistory.length - 5; i--) {
            ctx.fillText(LogHistory[i], 2, GAMEINFO.GAME_PIXEL_HEIGHT - (12 * (LogHistory.length - 1 - i)) - 4);
        }
    }
    TextLog.DrawLog = DrawLog;
})(TextLog || (TextLog = {}));
