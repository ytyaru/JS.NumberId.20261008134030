//https://www.webdesignleaves.com/pr/jquery/resizeObserver.html
//ResizeObserverはブラウザのバージョンによって使用できるプロパティ名やその構造が微妙に変わって使いづらいため、それを統一する。
//entries[0].(border|content|devicePixelContent)[0].(width|height|inlineSize|blockSize);
class ResizeObserverX {
    static setup(target, callback, options) {//target:HTMLElement, callback:(entries, observer)=>{}
        const observer = new ResizeObserver((entries, observer)=>{
            const objs = [];
            for (let entry of entries) {
                const obj = {target:entry.target, border:{}, content:{}};
                const wm = getComputedStyle(entry.target).getPropertyValue('writing-mode');
                const isV = wm.startsWith('vertical');
                obj.border = this._mapInBl(entry, 'borderBoxSize', isV);
                obj.content = this._mapInBl(entry, 'contentBoxSize', isV);
                obj.devicePixelContent = this._mapInBl(entry, 'devicePixelContentBoxSize', isV);
                if (!entry.contentBoxSize && entry.contentRect) {
                    obj.content = [{
                        inlineSize: isV ? entry.contentRect.height : entry.contentRect.width,
                        blockSize: isV ? entry.contentRect.width: entry.contentRect.height ,
                        width: entry.contentRect.width,
                        height: entry.contentRect.height,
                    }];
                }
                objs.push(Object.freeze(obj))
            }
            callback(Object.freeze(objs), observer);
        });
        console.log(observer)
        observer.observe(target, options);
        return observer;
    }
    static _mapInBl(entry, name, isV) {
        if (entry[name]) {return entry[name][0]
            ? entry[name].map(b=>this._mkObj(b, isV))
            : [this._mkObj(entry[name], isV)];
        }
    }
    static _mkObj(b, isV) { return {
        inlineSize: b.inlineSize,
        blockSize: b.blockSize,
        width: isV ? b.blockSize : b.inlineSize,
        height: isV ? b.inlineSize : b.blockSize,
    } }
}
