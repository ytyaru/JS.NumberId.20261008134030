;(function(){
class Clipboard {
    static async read() { return navigator.clipboard
            ? await navigator.clipboard.readText()
            : this.#readFallback(); }
    static async write(value) {
        if (navigator.clipboard) {await navigator.clipboard.writeText(value)}
        else {this.#writeFallback(value)}
    }
    static async #writeFallback(value) {
        if (!value || typeof value !== 'string' || !(value instanceof String)) {return ''}
        const id = 'copy'
        const ta = this.#mkTa(id);
        document.body.appendChild(ta);
        this.#selectedAll(id);
        document.execCommand(id);
        document.body.removeChild(ta);
    }
    static async #readFallback() {
        const id = 'paste'
        const ta = this.#mkTa(id);
        document.body.appendChild(ta);
        const elm = document.getElementById(ta.id);
        elm.focus();
        document.execCommand(id); // ファイル等テキスト以外のデータがクリップボードにある時は空文字がペーストされる
        const value = elm.value;
        document.body.removeChild(ta);
        return value;
    }
    static #selectedAll(id) {
        const elm = document.getElementById(id);
        elm.select();
        const range = document.createRange();
        range.selectNodeContents(elm);
        const sel = window.getSelection();
        if (sel) {
            sel.removeAllRanges();
            sel.addRange(range);
        }
        elm.setSelectionRange(0, elm.value.length);
    }
    static #mkTa(id='copy') {
        const ta = document.createElement('textarea');
        ta.id = `tmp-${id}`;
        ta.style.position = 'fixed';
        ta.style.right = '100vw';
        ta.style.fontSize = '16px';
        if ('copy'===id) {
            ta.readOnly = true;
            ta.value = value;
        } else if ('paste'===id){}
        else {throw new TypeError(`idはcopyかpasteのみ有効です:${id}`)}
        return ta;
    }
}
window.Clipboard = Clipboard;
})();
