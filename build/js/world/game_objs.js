var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
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
var Items;
(function (Items) {
    (function (ConsumableType) {
        ConsumableType[ConsumableType["HP"] = 0] = "HP";
        ConsumableType[ConsumableType["MP"] = 1] = "MP";
    })(Items.ConsumableType || (Items.ConsumableType = {}));
    var ConsumableType = Items.ConsumableType;
    ;
    var Consumable = (function () {
        function Consumable(type, value) {
        }
        return Consumable;
    }());
    Items.Consumable = Consumable;
    var Gear = (function () {
        function Gear(name, value, stats) {
            this.name = name;
            this.value = value;
            this.stats = stats;
        }
        return Gear;
    }());
    Items.Gear = Gear;
    var Weapon = (function (_super) {
        __extends(Weapon, _super);
        function Weapon() {
            _super.apply(this, arguments);
        }
        Weapon.generate = function (level) {
            return new Weapon("Sword", 100, []);
        };
        return Weapon;
    }(Gear));
    Items.Weapon = Weapon;
    var Armor = (function (_super) {
        __extends(Armor, _super);
        function Armor() {
            _super.apply(this, arguments);
        }
        return Armor;
    }(Gear));
    Items.Armor = Armor;
    var Ring = (function (_super) {
        __extends(Ring, _super);
        function Ring() {
            _super.apply(this, arguments);
        }
        return Ring;
    }(Gear));
    Items.Ring = Ring;
    var Necklace = (function (_super) {
        __extends(Necklace, _super);
        function Necklace() {
            _super.apply(this, arguments);
        }
        return Necklace;
    }(Gear));
    Items.Necklace = Necklace;
})(Items || (Items = {}));
