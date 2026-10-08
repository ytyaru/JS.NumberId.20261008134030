//https://www.webdesignleaves.com/pr/jquery/resizeObserver.html
//ResizeObserverはブラウザのバージョンによって使用できるプロパティ名やその構造が微妙に変わって使いづらいため、それを統一する。
//entries[0].(border|content|devicePixelContent)[0].(width|height|inlineSize|blockSize);
class ResizeObserverX extends ResizeObserver {
    constructor(callback) {
        const _mkObj = (b, isV)=>{return {
            inlineSize: b.inlineSize,
            blockSize: b.blockSize,
            width: isV ? b.blockSize : b.inlineSize,
            height: isV ? b.inlineSize : b.blockSize,
        } }
        const _mapInBl = (entry, name, isV)=>{//古いFirefoxは配列じゃないので配列化する
            if (entry[name]) {return entry[name][0]
                ? entry[name].map(b=>_mkObj(b, isV))
                : [_mkObj(entry[name], isV)];
            }
        }
        const fn = (entries, observer)=>{
            const objs = [];
            for (let entry of entries) {
                const obj = {target:entry.target, border:{}, content:{}};
                const wm = getComputedStyle(entry.target).getPropertyValue('writing-mode');
                const isV = wm.startsWith('vertical');
                obj.border = _mapInBl(entry, 'borderBoxSize', isV);
                obj.content = _mapInBl(entry, 'contentBoxSize', isV);
                obj.devicePixelContent = _mapInBl(entry, 'devicePixelContentBoxSize', isV);
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
        }
        super(fn);
    }
}
