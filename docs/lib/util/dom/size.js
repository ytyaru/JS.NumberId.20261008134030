// HTML要素に以下プロパティを追加する
// writingMode: isHorizontal, isVertical
// scrollBar:   has, size
// size:        borderBox, paddingBox, contentBox
(function(){
class ElementWritingMode {
    constructor(el) { this._el = el }
    get isHorizontal() { return Css.get('writing-mode', this._el).startsWith('horizontal') }
    get isVertical() { return Css.get('writing-mode', this._el).startsWith('vertical') }
    setHorizontal() { Css.set('writing-mode', 'horizontal-tb', this._el); this.#setTextOrientation(); }
    setVertical() { Css.set('writing-mode', 'vertical-rl', this._el); this.#setTextOrientation(); }
    toggle() { Css.set('writing-mode', ((this.isHorizontal) ? 'vertical-rl' : 'horizontal-tb'), this._el); this.#setTextOrientation(); }
    #setTextOrientation() { Css.set('text-orientation', ((this.isHorizontal) ? 'mixed' : 'upright'), this._el) }
}
class ElementScrollBar {
    constructor(el) { this._el = el; this._wm = new ElementWritingMode(this._el); }
    get has() { return ({horizontal:this.hasHorizontal, vertical:this.hasVertical}) }
    get hasHorizontal() { return (this._el.offsetHeight > this._el.clientHeight) }
    get hasVertical() { console.log(this._el.offsetWidth > this._el.clientWidth, this._el.offsetWidth, this._el.clientWidth);return (this._el.offsetWidth > this._el.clientWidth) }
    get size() { return ({width:this.width, height:this.height, inlineSize:this.inlineSize, blockSize:this.blockSize}) }
    get width() { return this._el.offsetWidth - this._el.clientWidth }
    get height() { return this._el.offsetHeight - this._el.clientHeight }
    get inlineSize() { return ((this._wm.isHorizontal) ? this.width : this.height) }
    get blockSize() { return ((this._wm.isHorizontal) ? this.height : this.width) }
}
class ElementSize {
    constructor(el) { this._el = el; this._wm = new ElementWritingMode(this._el); }
    get borderBox() {
        const b = this._el.getBoundingClientRect()
        b.inlineSize = ((this._wm.isHorizontal) ? b.width : b.height)
        b.blockSize = ((this._wm.isHorizontal) ? b.height : b.width)
        return b
    }
    get paddingBox() { return {
        width: this._el.clientWidth,
        height: this._el.clientHeight,
        inlineSize: ((this._wm.isHorizontal) ? this._el.clientWidth : this._el.clientHeight),
        blockSize: ((this._wm.isHorizontal) ? this._el.clientHeight : this._el.clientWidth)
    }}
    get contentBox() { 
        const s = getComputedStyle(this._el)
        return {
            width:parseInt(s.width),
            height:parseInt(s.height),
            inlineSize:parseInt(s.inlineSize),
            blockSize:parseInt(s.blockSize)
    }}
}
Object.defineProperty(HTMLElement.prototype,'WritingMode',{get:function(){this._WritingMode = this._WritingMode || new ElementWritingMode(this); return this._WritingMode;}})
Object.defineProperty(HTMLElement.prototype,'ScrollBar',{get:function(){this._ScrollBar = this._ScrollBar || new ElementScrollBar(this); return this._ScrollBar;}})
Object.defineProperty(HTMLElement.prototype,'Size',{get:function(){this._Size = this._Size || new ElementSize(this); return this._Size;}})
/*
Object.defineProperty(HTMLElement.prototype,'WritingMode',{get:function(){return new ElementWritingMode(this)}})
Object.defineProperty(HTMLElement.prototype,'ScrollBar',{get:function(){return new ElementScrollBar(this)}})
Object.defineProperty(HTMLElement.prototype,'Size',{get:function(){return new ElementSize(this)}})
*/
})()

