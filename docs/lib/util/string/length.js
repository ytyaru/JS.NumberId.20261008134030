String.prototype.halfWidthLength = function() { // https://qiita.com/yoya/items/5da038312279f98bdd28
    let len = 0
    let width = 0
    for (const c of this) {
        const cp = c.codePointAt(0)
        if ((0x00 <= cp) && (cp < 0x7f)) { width = 1 } // ASCII 記号/数字/アルファベット
        else if ((0xff61 <= cp) && (cp < 0xffa0)) { width = 1 } // 半角カナ
        else if (cp === 0x200d) {  width = -width } // ZWJ 合成絵文字のノリしろ
        else if (((0xfe00 <= cp) && (cp <= 0xfe0f)) || ((0xe0100 <= cp) && (cp <= 0xe01fe))) { } // 異体字セレクタは幅0扱い
        else if ((0x1f3fb <= cp) && (cp <= 0x1f3ff)) { } // 絵文字修飾も幅0扱い
        else { width = 2 } // きっと全角
        len += width
    }
    return len
}
String.prototype.segmenter = function(granularity, locale) {
    if (!['grapheme', 'word', 'sentence'].includes(granularity)) { granularity = 'grapheme' }
    if (!locale) { locale = window.navigator.language }
    if (!this.hasOwnProperty('_segmenters')) { this._segmenters = new Map() }
    locale = locale.trim().toLowerCase().replace(/_\.\- /g, '-')
    if (['ja'].includes(locale)) { locale = 'ja-jp' }
    if ('ja'===window.navigator.language && 'en'===locale) { locale = 'en-us' }
    if (!this._segmenters.has(`${locale}-${granularity}`)) {
        this._segmenters.set(`${locale}-${granularity}`, 
            new Intl.Segmenter((locale) ? locale : window.navigator.language, { granularity:granularity }))
    }
    return this._segmenters.get(`${locale}-${granularity}`)
}
String.prototype.graphemes = function(locale) {
    return Array.from(this.segmenter('grapheme', locale).segment(this)).map(s=>s.segment)
}
String.prototype.words = function(locale) {
    return Array.from(this.segmenter('word', locale).segment(this)).map(s=>s.segment)
}
String.prototype.sentences = function(locale) {
    return Array.from(this.segmenter('sentence', locale).segment(this)).map(s=>s.segment)
}
Object.defineProperty(String.prototype, 'HalfWidthLength', {
    get: function(){return this.halfWidthLength()}
});
Object.defineProperty(String.prototype, 'Graphemes', {
    get: function(){return Array.from(this.segmenter('grapheme').segment(this)).map(s=>s.segment)}
});
Object.defineProperty(String.prototype, 'Words', {
    get: function(){return Array.from(this.segmenter('word').segment(this)).map(s=>s.segment)}
});
Object.defineProperty(String.prototype, 'Sentences', {
    get: function(){return Array.from(this.segmenter('sentence').segment(this)).map(s=>s.segment)}
});
