/// <reference path="./spritesheet.ts"/>
interface SpriteSheetArray {
    [index: string]: SpriteSheet;
}
namespace SpriteSheetCache {
    let sheets: SpriteSheetArray = {};

    export function storeSheet(sheet: SpriteSheet): void {
        sheets[sheet.name] = sheet;
    }

    export function spriteSheet(name: string): SpriteSheet {
        return sheets[name];
    }
}
