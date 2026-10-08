(function(){ // dependences: type.js, css.js, dom/client-area.js , dom/size.js
class Font {
    get MIN() { return 16 }
    get size() { return this.calc(ClientArea.inlineSize) }
    calc(param) { return ((Type.isEl(param) ? this.#calcFromEl(param) : this.#calcFromInlineSize(param))) }
    #calcFromEl(el) { return this.calc((el || document.body).Size.contentBox.inlineSize) }
    #calcFromInlineSize(inlineSize) {
        inlineSize = inlineSize || ClientArea.inlineSize
        const minLineChars = inlineSize / this.MIN
        if (minLineChars <= 30) { return 16; }      // Screen<=480px: 16px  /1字  1  〜30  字/行
        else if (minLineChars <= 40) { return 18; } // Screen<=640px: 18px  /1字 26.6〜35.5字/行
        else { return (inlineSize / 40); }          // Screen> 640px: 16px〜/1字 40        字/行
    }
}
window.Font = new Font()
})()
