var Cell = (function () {
    function Cell(tileID, itemIDs, entityID) {
        if (tileID === void 0) { tileID = 0; }
        if (itemIDs === void 0) { itemIDs = []; }
        if (entityID === void 0) { entityID = null; }
        this.tileID = tileID;
        this.entityID = entityID;
        this.itemIDs = itemIDs;
        this.visable = false;
        this.discovered = false;
    }
    return Cell;
}());
