class AudioPool {
    private pool: HTMLAudioElement[] = [];
    private index: number = 0;
    private maxSize: number;

    constructor(sound: string, maxSize: number = 1) {
        this.maxSize = maxSize
        for (var i: number = 0; i < this.maxSize; i++) {
            this.pool[i] = new Audio(sound);
            this.pool[i].load();
        }
    }

    play(): void {
        if (this.pool[this.index].currentTime == 0 || this.pool[this.index].ended) {
            this.pool[this.index].play();
        }
        this.index = (this.index + 1) % this.maxSize;
    }
}
