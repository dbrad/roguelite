class TileSet { }
class Stat {
    name: string;
    value: number;
}
namespace Items {
    export interface Item {
        name: string;
        value: number;
    }
    export enum ConsumableType { HP, MP };
    export class Consumable implements Item {
        name: string;
        value: number;
        constructor(type: ConsumableType, value: number) {

        }
    }
    export class Gear implements Item {
        name: string;
        value: number;
        stats: Stat[];
        constructor(name: string, value: number, stats: Stat[]) {
            this.name = name;
            this.value = value;
            this.stats = stats;
        }
    }
    export class Weapon extends Gear {
        damage: number;
        public static generate(level: number): Weapon {
            return new Weapon("Sword", 100, []);
        }
    }
    export class Armor extends Gear {
        armor: number;
    }
    export class Ring extends Gear {

    }
    export class Necklace extends Gear {

    }
}
