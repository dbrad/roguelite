class Cell {
    public tileID: number;
    public entityID: number;
    public itemIDs: number[];
    public visable: boolean;
    public discovered: boolean;

    constructor(tileID: number = 0, itemIDs: number[] = [], entityID: number = null) {
        this.tileID = tileID;
        this.entityID = entityID;
        this.itemIDs = itemIDs;
        this.visable = false;
        this.discovered = false;
    }
}
