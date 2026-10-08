(function(){ // dependences: type.js, css.js, dom/client-area.js , dom/size.js
class Font {
    get MIN() { return 16 }
    get LetterSpcingEm() { return 0.05 }
    get LetterSpcing() { return (this.MIN*this.LetterSpcingEm) }
    get LineHeightEm() { return 1.7 }
    get size() { return this.calc(ClientArea.inlineSize) }
    calc(param) { return ((Type.isEl(param) ? this.#calcFromEl(param) : this.#calcFromInlineSize(param))) }
    #calcFromEl(el) { return this.calc((el || document.body).Size.contentBox.inlineSize) }
    #calcFromInlineSize(inlineSize) {
        inlineSize = inlineSize || ClientArea.inlineSize
        const minLineChars = inlineSize / (this.MIN + this.LetterSpcing)
        console.log(inlineSize, (this.MIN + this.LetterSpcing), minLineChars, this.#lineChars(30), this.#lineChars(40))
        if (minLineChars <= 30) { return 16; }      // Screen<=480px: 16px  /1字  1  〜30  字/行
        else if (minLineChars <= 40) { return 18; } // Screen<=640px: 18px  /1字 26.6〜35.5字/行
        else { return (inlineSize / this.#lineChars(40)); }               // Screen> 640px: 16px〜/1字 40        字/行
    }
    #lineChars(chars) { return chars + (chars * this.LetterSpcingEm) }
    #inlineSize(param) {
        if (Type.isEl(param)) { return param.Size.contentBox.inlineSize }
        else if (Type.isNum(param)) { return param }
        else { return ClientArea.inlineSize }
    }
    calcMaxLineChars(el) { return this.#inlineSize(param) / (this.MIN + this.LetterSpcing) }
    fit(el) { Css.set('font-size', `${this.calc(el)}px`, (el || document.body)); this.#setLsLh(el); }
    #setLsLh(el) {
        Css.set('letter-spacing', `${this.LetterSpcingEm}em`, (el || document.body))
        Css.set('line-height', `${this.LineHeightEm}em`, (el || document.body))
    }
//    getLetterSpacing(el) { return Css.getFloat('letter-spacing', (el || document.body)) } // 'normal'
//    getLineHeight(el) { return Css.getFloat('line-height', (el || document.body)) } // 'normal'
}
window.Font = new Font()
})()
