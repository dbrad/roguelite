var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var ECS;
(function (ECS) {
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
        var Name = (function (_super) {
            __extends(Name, _super);
            function Name(name) {
                _super.call(this, "name");
                this.value = name;
            }
            return Name;
        }(Component));
        Components.Name = Name;
        var Sprite = (function (_super) {
            __extends(Sprite, _super);
            function Sprite(image) {
                _super.call(this, "sprite");
                this.value = image;
            }
            return Sprite;
        }(Component));
        Components.Sprite = Sprite;
        var TilePos = (function (_super) {
            __extends(TilePos, _super);
            function TilePos() {
                _super.call(this, "pos");
                this.value = new Point(0, 0);
            }
            return TilePos;
        }(Component));
        Components.TilePos = TilePos;
        var TorchStr = (function (_super) {
            __extends(TorchStr, _super);
            function TorchStr() {
                _super.call(this, "torch");
                this.value = 5;
            }
            return TorchStr;
        }(Component));
        Components.TorchStr = TorchStr;
        var Alive = (function (_super) {
            __extends(Alive, _super);
            function Alive() {
                _super.call(this, "alive");
                this.value = true;
            }
            return Alive;
        }(Component));
        Components.Alive = Alive;
        var Audio = (function (_super) {
            __extends(Audio, _super);
            function Audio(soundName, sound) {
                _super.call(this, "audio-" + soundName);
                this.value = new AudioPool(sound, 3);
            }
            return Audio;
        }(Component));
        Components.Audio = Audio;
    })(Components = ECS.Components || (ECS.Components = {}));
})(ECS || (ECS = {}));
