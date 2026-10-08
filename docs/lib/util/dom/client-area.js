(function(){
class ClientArea {
    constructor() {
        this._writingMode = new ClientWritingMode()
        this._scrollBar = new ClientScrollBar(this._writingMode)
    }
    get WritingMode() { return this._writingMode }
    get ScrollBar() { return this._scrollBar }

    get width() { return document.body.clientWidth }
    get height() { return document.documentElement.clientHeight }
    get edge() { return ({long:this.long, short:this.short}) }
    get long() { return (this.height <= this.width) ? {dir:'width', size:this.width} : {dir:'height', size:this.height} }
    get short() { return (this.height <= this.width) ? {dir:'height', size:this.height} : {dir:'width', size:this.width} }
    get longDir() { return (this.height <= this.width) ? 'width' : 'height' }
    get shortDir() { return (this.height <= this.width) ? 'height' : 'width' }
    get longSize() { return (this.height <= this.width) ? this.width : this.height }
    get shortSize() { return (this.height <= this.width) ? this.height : this.width }
    get isLandscape() { return 'width'===this.longDir }
    get isPortrate() { return 'height'===this.longDir }
    get inlineSize() { return ((this._writingMode.isHorizontal) ? this.width : this.height) }
    get blockSize() { return ((this._writingMode.isHorizontal) ? this.height : this.width) }
}
class ClientWritingMode {
    get isHorizontal() { return Css.get('writing-mode').startsWith('horizontal') }
    get isVertical() { return Css.get('writing-mode').startsWith('vertical') }
    setHorizontal() { Css.set('writing-mode', 'horizontal-tb'); this.#setTextOrientation(); }
    setVertical() { Css.set('writing-mode', 'vertical-rl'); this.#setTextOrientation(); }
    toggle() { Css.set('writing-mode', ((this.isHorizontal) ? 'vertical-rl' : 'horizontal-tb')); this.#setTextOrientation(); }
    #setTextOrientation() { Css.set('text-orientation', ((this.isHorizontal) ? 'mixed' : 'upright')) }
}
class ClientScrollBar {
    constructor(clientWritingMode) { this._cwm = clientWritingMode }
    get hasHorizontal() { return 0 < this.width }
    get hasVertial() { return 0 < this.height }
    get width() { return Math.max(0, window.innerWidth - document.body.clientWidth) }
    get height() { return Math.max(0, (window.innerHeight - document.documentElement.clientHeight)) }
    get inlineSize() { return ((this._cwm.isHorizontal) ? this.width : this.height) }
    get blockSize() { return ((this._cwm.isHorizontal) ? this.height : this.width) }
}
window.ClientArea = new ClientArea()
})()
