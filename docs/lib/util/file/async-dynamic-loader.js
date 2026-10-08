// https://github.com/ytyaru/Html.VanJS.ES5.DynamicImporter.20250108131626
;(function(){
class Injector { // 指定した要素を所定の箇所に挿入する
    static inject(el) {
        const parent = this.#getParent(el);
        parent.appendChild(el)
    }
    static #getParent(el) {
        if (['SCRIPT','IMG'].some(n=>n===el.tagName)) { return document.body }
        else if ('LINK'===el.tagName) {return document.head} // <link rel="stylesheet">はbodyに動的挿入しても反映されなかった
        else {console.warn(`指定された要素は挿入の対象外です。script,link,img要素のみ有効です:`, el); return null;}
    }
}
class ElementMakerRouter { // 読み込むファイルの種別に応じたMakerを返す
    constructor(type='img.onerror') {
        this._map = new Map(this.select(type));
    }
    get(path) {
        console.log('ElementMakerRouter.get():', path)
        const parts = path.split('.')
        const ext = parts.slice(-1)[0]
        if (!this._map.has(ext)) {
            console.warn(`拡張子 ${ext} は動的読込できません。${[...this._map.keys()]}のいずれかのみ動的読込できます。次のファイルの読込はしません。:${path}`);
            return null
        } else {return this._map.get(ext)}
    }
    select(type) { return [
        ['js', new PromiseScriptElementMaker()],
        ['css', new PromiseLinkElementMaker(type)],
    ] }
}
class CallbackScriptElementMaker { // <script>
    make(src, onLoad, onError) {
        const onload = (e)=>{ onLoad({status:'resolve', path:src, event:e}); };
        const onerror = (e)=>{ onError({status:'reject', path:src, event:e}); };
        return this.makeBase(src, onload, onerror)
    }
    makeBase(src, onLoad, onError) {
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.className = 'dynamic-loader';
        script.src = src;
        script.onload = onLoad;
        script.onerror = onError;
        return script;
    }
}
class CallbackLinkElementMaker { // <link onload>/<link>+<img onerror>
    constructor(type='img.onerror') {
        this._type = this.getType(type)
        this._makers = {'img.onerror':null,'link.onload':null}
    }
    make(path, resolver, rejector) { return this.getMaker().make(path, resolver, rejector) }
    getMaker() {
        if (!this._makers[this._type]) { this._makers[this._type] = Reflect.construct(this.selectMaker(), []) }
        return this._makers[this._type]
    }
    selectMaker() { return 'link.onload'===this._type ? CallbackOnLoadLinkElementMaker : CallbackImgOnErrorLinkElementMaker; }
    getType(type) {
        if ('img.onerror'===type) {return type}
        else if ('link.onload'===type) {return type}
        else {console.log(`指定したtype:${type}は未対応値です。代わりに旧式かつ全環境対応と思われるimg.onerrorを設定します。`); return 'img.onerror';}
    }
}
class CallbackOnLoadLinkElementMaker {// <link>
    make(href, resolver, rejector) {
        const link = document.createElement('link');
        link.href = href;
        link.rel = 'stylesheet';
        link.className = 'dynamic-loader';
        link.onload = resolver; // <link>にonloadがないか、存在しても機能しない場合がある！ブラウザの実装次第。
        link.onerror = rejector;
        return [link];
    }
}
class CallbackImgOnErrorLinkElementMaker {// <link onload>のフォールバック（<img onerror>で代用する）
    // <link>にonloadがないか、存在しても機能しない場合、代わりにimg要素のonerrorで行う
    // https://stackoverflow.com/questions/3078584/link-element-onload
    // https://www.viget.com/articles/js-201-run-a-function-when-a-stylesheet-finishes-loading/
    // https://qiita.com/rana_kualu/items/95a7adf8420ea2b9f657
    make(src, resolver, rejector) {
        console.log('CallbackImgOnErrorLinkElementMaker.make()')
        const link = document.createElement('link');
        link.href = src
        link.rel = 'stylesheet'
        link.className = 'dynamic-loader';
        //document.body.appendChild(link); // bodyに挿入しても反映されなかった（色が赤にならなかった）
//        document.head.appendChild(link); // ここで挿入せず後で一括してやる
        // fallback link.onload
        const img = document.createElement('img');
        img.className = 'dynamic-loader';
        img.onerror = resolver;
//        document.body.appendChild(img); // ここで挿入せず後で一括してやる
        img.src = src;
        return [link, img]
    }
}
class PromiseScriptElementMaker extends CallbackScriptElementMaker {
    make(path, onLoad, onError) {
        return new Promise((resolve, reject)=>{
            try {
                const onLoad = (e)=>resolve({ status:'resolve', path:path, event:e });
                const onError = (e)=>reject({ status:'reject', path:path, event:e });
                const el = super.makeBase(path, onLoad, onError)
                Injector.inject(el)
            } catch (err) {reject({ status:'exception', path:path, event:err })}
        })
    }
}
class PromiseLinkElementMaker extends CallbackLinkElementMaker {
    constructor(type='img.onerror') { super(type) }
    make(path, onSucceeded, onFailed) {
       return new Promise((resolve, reject)=>{
            try {
                const onLoad = (e)=>{resolve({ status:'resolve', path:path, event:e });this.delImg.apply(this, [path]);};
                const onError = (e)=>{reject({ status:'reject', path:path, event:e });this.delImg.apply(this, [path]);};
                const els = super.make(path, onLoad, onError)
                els.map(el=>Injector.inject(el))
            } catch (err) {reject({ status:'exception', path:path, event:err });this.delImg.apply(this, [path]);}
        })
    }
    delImg(path) {document.querySelector(`img.dynamic-loader[src="${path}"]`).remove()}
}
class AsyncDynamicLoader {
    constructor(onSucceeded, onFailed, onFinally, onStepSucceeded, onStepFailed, onStepFinally) {
        this._onSucceeded = 'function'===typeof onSucceeded ? onSucceeded : ()=>{};
        this._onFailed = 'function'===typeof onFailed ? onFailed : ()=>{};
        this._onFinally = 'function'===typeof onFinally ? onFinally : ()=>{};
        this._onStepSucceeded = 'function'===typeof onStepSucceeded ? onStepSucceeded : (res)=>{};
        this._onStepFailed = 'function'===typeof onStepFailed ? onStepFailed : (e)=>{};
        this._onStepFinally = 'function'===typeof onStepFinally ? onStepFinally : (e)=>{};
        this._emr = new ElementMakerRouter()
    }
    async series(...paths) { // 全件を直列に読み込む
        try {
            const promises = this.#getPromises(...paths)
            for (const promise of promises) { await promise; }
            this._onSucceeded(...paths)
        } catch (err) { this._onFailed(err, ...paths); }
        finally {this._onFinally()}
    }
    async all(...paths) {// 全件を並列に読み込む（一件でもエラーがあればその時点で中断する）
        try {
            const promises = this.#getPromises(...paths)
            const res = await Promise.all(promises);
            this._onSucceeded(res, ...paths)
        } catch (err) { this._onFailed(err, ...paths); }
        finally {this._onFinally()}
    }
    async allSettled(...paths) {// 全件を並列に読み込む（エラーがあっても全件実行する）
        try {
            const promises = this.#getPromises(...paths)
            const results = await Promise.allSettled(promises);
            for (let result of results) {
                if ('fulfilled'===reuslt.status) {this._onStepSucceeded(result)}
                else if ('rejected'===reuslt.status) {this._onStepFailed(result)}
            }
            this._onSucceeded(results, ...paths)
        } catch (err) { this._onFailed(err, ...paths); }
        finally {this._onFinally()}
    }
    async race(...paths) {// 全件を並列に読み込む（最初に一件解決した時点で中断する）
        try {
            const promises = this.#getPromises(...paths)
            const res = await Promise.race(promises);
            this._onSucceeded(res, ...paths)
        } catch (err) { this._onFailed(err, ...paths); }
        finally {this._onFinally()}
    }
    #getPromises(...paths) {return [...paths].map(path=>this._emr.get(path).make(path,this._onStepSucceeded, this._onStepFailed))}
}
window.AsyncDynamicLoader = AsyncDynamicLoader;
})();
