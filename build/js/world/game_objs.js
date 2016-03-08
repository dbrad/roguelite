var TileSet = (function () {
    function TileSet() {
    }
    return TileSet;
}());
var Stat = (function () {
    function Stat() {
    }
    return Stat;
}());
var Item = (function () {
    function Item(name, value, stats) {
        if (stats === void 0) { stats = []; }
        this.name = name;
        this.value = value;
        this.stats = stats;
    }
    return Item;
}());
