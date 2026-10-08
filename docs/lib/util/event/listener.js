(function(){//HTML要素に_listeners/litten/unlistenを追加する。
function isEl(v) {return v instanceof HTMLElement}
function isStr(v) {return 'string'===typeof v || v instanceof String}
function isFn(v) {return 'function'===typeof v && !v.toString().match(/^class /)}
function isAFn(v) {return (v instanceof (async function () {}.constructor))}
function isHandler(v) {return isFn(v) || isAFn(v)}
function isBln(v){return 'boolean'===typeof v}
class Listener {
    static add(el, name, handler, useCapture=false) {// element, name, handler, options/useCapture
        if (!isEl(el)) {throw new TypeError('対象要素（HTMLElement）が必要です。')}
        if (!isStr(name)) {throw new TypeError('第一引数はイベント名（String）であるべきです。')}
        if (!isHandler(handler)) {throw new TypeError('第二引数はイベントハンドラ（Function/AsyncFunction）であるべきです。')}
        if (!isBln(useCapture)) {throw new TypeError('第三引数はuseCapture（Boolean）であるべきです。')}
        if (!('_listeners' in el)) {
            el._listeners = []
            el.removeAllEventListener = function() {
                this._listeners.map(l=>Listener.remove(this, ...l));
            }
        }
        const i = el._listeners.findIndex(l=>name===l.name && useCapture===l.useCapture);
        if (-1===i) {
            el._listeners.push({name:name, useCapture:useCapture, handlers:[handler]});
            el.addEventListener(name, handler, useCapture);
        } else {
            if (el._listeners[i].handlers.includes(handler)) {return} // 重複登録防止
            el._listeners[i].handlers.push(handler);
            el.addEventListener(name, handler, useCapture);
        }
    }
    // 条件に一致したリスナーを削除する
    static remove(el, name, handler, useCapture) {// elは必須。name/handler/useCaptureは任意(null/undefinedなら全件対象)
        if (!('_listeners' in el)){return}
        const targets = el._listeners.filter(l=>(name ? name===l.name : true) && ('boolean'===typeof useCapture ? useCapture===l.useCapture : true) && (handler ? l.handlers.includes(handler) : true));
        // ハンドラ[一|全]件削除
        const REMOVE = handler
            ? ((t)=>{
                console.log(t)
                const i = t.handlers.indexOf(handler);
                el.removeEventListener(t.name, t.handlers[i], t.useCapture);
                t.handlers.splice(i, 1);
            })
            : ((t)=>{
                t.handlers.map(l=>el.removeEventListener(t.name, l, t.useCapture));
                t.handlers.length = 0;
            });
        targets.map(t=>REMOVE(t));
        // リスナ削除(ハンドラ0件のリスナ削除)
        el._listeners = el._listeners.filter(l=>0!==l.handlers.length);
    }
}
// EventTarget <-- Node <-- Element  ElementはEventTargetからプロパティを継承している。
EventTarget.prototype.listen = function(name, handler, useCapture=false) {//addEventListenerのハンドラ管理版
    Listener.add(this, name, handler, useCapture);
};
EventTarget.prototype.unlisten = function(name, handler, useCapture) {//removeEventListenerのハンドラ管理版
    Listener.remove(this, name, handler, useCapture);
};
EventTarget.prototype.tell = function(event) {return this.dispatchEvent(event);}//dispatchEventの糖衣構文版

// 要素を削除するときunlistenする
// 自身と子孫を削除する（再帰。子孫も削除される。標準APIは再帰せずメモリリークしうるので改善した）
HTMLElement.prototype._remove = HTMLElement.prototype.remove;
HTMLElement.prototype.remove = function() {//自身と子孫をremoveする
    while (this.firstChild) {this.firstChild.remove(this.firstChild)}
    this.unlisten(); this._remove();
};
// 指定した子要素childを削除する（再帰。子孫も削除される。標準APIは再帰せずメモリリークしうるので改善した）
HTMLElement.prototype._removeChild = HTMLElement.prototype.removeChild;
HTMLElement.prototype.removeChild = function(child) {if ([...this.children].some(c=>c===child)) {child.remove();}};
// 自身は残し子孫だけを削除する
HTMLElement.prototype.removeChildren = function() {while(this.firstChild){this.firstChild.remove()}};
})();
