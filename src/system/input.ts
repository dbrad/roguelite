namespace Input {
    export namespace KB {
        export enum KEY {
            A = 65,
            D = 68,
            W = 87,
            S = 83,
            LEFT = 37,
            RIGHT = 39,
            UP = 38,
            DOWN = 40,
            ENTER = 13,
            SPACE = 32
        }

        let _isDown: boolean[] = [];
        let _isUp: boolean[] = [];
        let _wasDown: boolean[] = [];

        for (let i: number = 0; i < 256; i++) {
            _isUp[i] = true;
        }

        export function isDown(keyCode: KEY): boolean {
            return (_isDown[keyCode]);
        }

        export function wasDown(keyCode: KEY): boolean {
            let result: boolean = _wasDown[keyCode];
            _wasDown[keyCode] = false;
            return (result);
        }

        export function keyDown(event: KeyboardEvent): void {
            let keyCode: number = event.which;
            _isDown[keyCode] = true;
            if (_isUp[keyCode]) {
                _wasDown[keyCode] = true;
            }
            _isUp[keyCode] = false;
        }

        export function keyUp(event: KeyboardEvent): void {
            let keyCode: number = event.which;
            _isDown[keyCode] = false;
            _isUp[keyCode] = true;
        }
    }
}
