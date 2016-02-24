namespace ImageCache {
    var cache: ImageArray = {};
    export function getTexture(name: string): HTMLImageElement {
        return cache[name];
    }

    var toLoad: StringArray = {};
    var loadCount = 0;
    export namespace Loader {
        export function add(name: string, url: string): void {
            toLoad[name] = url;
            loadCount++;
        }

        export function load(callback: any): void {
            var async = { counter: 0, loadCount: 0, callback: callback };
            var done = function(async: any) { if ((async.counter++) === async.loadCount) { async.callback(); } };
            for (var img in toLoad) {
                cache[img] = new Image();
                cache[img].src = toLoad[img];
                cache[img].onload = done.bind(this, async);
                delete toLoad[img]
            }
            loadCount = 0;
        }
    }
}
