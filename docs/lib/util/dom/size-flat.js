// HTML要素に以下プロパティを追加する
// writingMode: isHorizontal, isVertical
// scrollBar:   has, size
// size:        borderBox, paddingBox, contentBox
Object.defineProperty(HTMLElement.prototype,'isHorizontal',{get:function(){return Css.get('writing-mode',this).startsWith('horizontal')}})
Object.defineProperty(HTMLElement.prototype, 'isVertical',{get:function(){return Css.get('writing-mode',this).startsWith('vertical')}})
Object.defineProperty(HTMLElement.prototype,'hasScrollBar',{get:function(){return {horizontal:this.hasHorizontalScrollBar, vertical:this.hasVerticalScrollBar}}})
Object.defineProperty(HTMLElement.prototype,'hasHorizontalScrollBar',{get:function(){return (this.offsetHeight > this.clientHeight)}})
Object.defineProperty(HTMLElement.prototype,'hasVerticalScrollBar',{get:function(){return (this.offsetWidth > this.clientWidth)}})
Object.defineProperty(HTMLElement.prototype,'scrollBarSize',{get:function(){return {horizontal:this.horizontalScrollBarSize, vertical:this.verticalScrollBarSize}}})
Object.defineProperty(HTMLElement.prototype,'horizontalScrollBarSize',{get:function(){return (this.offsetHeight - this.clientHeight)}})
Object.defineProperty(HTMLElement.prototype,'verticalScrollBarSize',{get:function(){return (this.offsetWidth - this.clientWidth)}})
Object.defineProperty(HTMLElement.prototype,'borderBox',{get:function(){const b=this.getBoundingClientRect(); b.inlineSize=((this.isHorizontal) ? b.width : b.height); b.blockSize=((this.isHorizontal) ? b.height : b.width); return b;}})
Object.defineProperty(HTMLElement.prototype,'paddingBox',{get:function(){return ({width:this.clientWidth, height:this.clientHeight, inlineSize:((this.isHorizontal) ? this.clientWidth : this.clientHeight), blockSize:((this.isHorizontal) ? this.clientHeight : this.clientWidth)})}})
Object.defineProperty(HTMLElement.prototype,'contentBox',{get:function(){const s=getComputedStyle(this); return ({width:parseInt(s.width), height:parseInt(s.height), inlineSize:parseInt(s.inlineSize), blockSize:parseInt(s.blockSize)})}})

