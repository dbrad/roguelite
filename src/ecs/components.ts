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
        export class Name extends Component<string> {
            constructor(name: string) {
                super("name");
                this.value = name;
            }
        }
        export class Sprite extends Component<HTMLCanvasElement> {
            constructor(image: HTMLCanvasElement) {
                super("sprite");
                this.value = image;
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
        export class Audio extends Component<AudioPool> {
            constructor(soundName: string, sound: string) {
                super("audio-" + soundName);
                this.value = new AudioPool(sound, 3);
            }
        }
    }
}
