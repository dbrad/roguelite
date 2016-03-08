class TileSet { }
class Stat {
    name: string;
    value: number;
}
class Item {
    name: string;
    value: number;
    type: string;
    stats: Stat[];
    constructor(name: string, value: number, stats: Stat[] = []) {
        this.name = name;
        this.value = value;
        this.stats = stats;
    }
}
