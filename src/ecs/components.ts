namespace ECS {
    export namespace Components {
        export class Component<T> {
            name: string;
            value: T;
            constructor(name: string) {
                this.name = name;
            }
        }
        export class IsPlayer extends Component<boolean> {
            constructor() {
                super("player");
                this.value = true;
            }
        }
        export class IsEnemy extends Component<boolean> {
            constructor() {
                super("enemy");
                this.value = true;
            }
        }
        export class TilePos extends Component<Point> {
            constructor() {
                super("pos");
                this.value = new Point(0, 0);
            }
        }
        export class TorchStr extends Component<number> {
            constructor() {
                super("torch");
                this.value = 5;
            }
        }
        export class Alive extends Component<boolean> {
            constructor() {
                super("alive");
                this.value = true;
            }
        }
    }
}
