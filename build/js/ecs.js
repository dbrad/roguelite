var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var ECS;
(function (ECS) {
    var Entity = (function () {
        function Entity() {
            this.components = {};
            if (!Entity.autoID)
                Entity.autoID = 0;
            this.id = Entity.autoID++;
        }
        Entity.prototype.addComponent = function (component) {
            this.components[component.name] = component;
            this[component.name] = component;
        };
        return Entity;
    }());
    ECS.Entity = Entity;
    var Components;
    (function (Components) {
        var Component = (function () {
            function Component(name) {
                this.name = name;
            }
            return Component;
        }());
        Components.Component = Component;
        var IsPlayer = (function (_super) {
            __extends(IsPlayer, _super);
            function IsPlayer() {
                _super.call(this, "player");
                this.value = true;
            }
            return IsPlayer;
        }(Component));
        Components.IsPlayer = IsPlayer;
        var IsEnemy = (function (_super) {
            __extends(IsEnemy, _super);
            function IsEnemy() {
                _super.call(this, "enemy");
                this.value = true;
            }
            return IsEnemy;
        }(Component));
        Components.IsEnemy = IsEnemy;
        var TilePos = (function (_super) {
            __extends(TilePos, _super);
            function TilePos() {
                _super.call(this, "pos");
                this.value = { x: 0, y: 0 };
            }
            return TilePos;
        }(Component));
        Components.TilePos = TilePos;
    })(Components = ECS.Components || (ECS.Components = {}));
})(ECS || (ECS = {}));
