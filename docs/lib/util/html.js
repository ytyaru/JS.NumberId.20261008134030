(function() {
class Html {
    constructor() {
        this.parser = new DOMParser()
        this.serializer = new XMLSerializer()
        this.t2e = new Text2Element()
    }
    // get
    get Url() { return location.href }
    get Doc() { return document.documentElement }
    get Root() { return document.querySelector(':root') }
    get Body() { return document.body }
    get Main() { return document.querySelector('main:not([hidden])') }
    get Header() { return document.querySelector('header') }
    get Footer() { return document.querySelector('footer') }
    next(el) { return el.nextElementSibling }
    prev(el) { return el.previousElementSibling }
    parent(el) { return el.parentElement; }
    children(el) { return el.children }
    child(el,i=0) {
        if (0 < el.children.length) {
            if(Type.isPosInt(i)) { return el.children[i] }
            else if(Type.isNegInt(i)) { return el.children[el.children.length-i] }
        }
        return null
    }
    broser(el, i=1) {
        if (0===i) { return el }
        const prop = (0<i) ? 'nextElementSibling' : 'previousElementSibling'
        for (let c=0; c<Math.abs(i); c++) { el = el[prop]; if (null===el) { return el } }
        return el
    }
    older(el, i=1) { return this.broser(el, (i<0) ? i : i*-1) }
    yanger(el, i=1) {return this.broser(el, (i<0) ? i*-1 : i) }
    get(query) { return document.querySelector(query) }
    gets(query) { return [...document.querySelectorAll(query)] }
    // insert
    prepend(addEl, el) { el.parentElement.insertBefore(addEl, el) }
    append(addEl, el) { el.parentElement.insertBefore(addEl, el.nextElementSibling) }
    insert(addEl, el, i) { el.parentElement.insertBefore(addEl, this.broser(el, i)) }
    insertChild(addEl, el, i) { el.insertBefore(addEl, (0<=i) ? el.children[i] : el.children[el.children.length+i]) }
    // create
    create(tagName, attrs, text) {
        const el = document.createElement(tagName)
        if (attrs) { for (let key of Object.keys(attrs)) { el[key] = attrs[key] } }
        if (text) {  el.textContent = text }
        return el
    }
    sugger(str) { return this.t2e.build(str) } // pub like
    generate(tagName, attrs, text) { return this.toString(this.create(tagName, attrs, text)) }
    toString(el) { return this.serializer.serializeToString(el).replace(/ xmlns="[^"]+"/, '') }
    toDom(str) { return this.parser.parseFromString(str, 'text/html') }
    toHtml(str) { return this.toDom(str).children[0] }
    toElements(str) { return [...this.toHtml(str).querySelector('body').children] }
    toElement(str) { return this.toElements(str)[0] }
    // attr
    attr(el, key, value) { return (value) ? el.setAttribute(key, value) : el.getAttribute(key) }
    attrInt(el, key, value) { return parseInt(this.attr(el, key, value)) }
    attrFloat(el, key, value) { return parseFloat(this.attr(el, key, value)) }
    attrs(el) {
        const attrs = {}
        for (let key of el.getAttributeNames()) { attrs[key] = el.getAttribute(key) }
        return attrs
    }
}
class Text2Element {
    build(text) { // pug like: elName#id.class1.class2 style="display:none;margin:0;" enabled="true" textContent
        const parts = text.split(' ')
        const el = document.createElement(this.#getTagName(parts[0]))
        console.log(el)
        this.#setId(el, parts[0])
        this.#setClass(el, parts[0])
        this.#setAttr(el, parts.slice(1))
        this.#setText(el, (1<parts.length) ? parts.slice(-1)[0] : '')
        return el
    }
    #getTagName(text) { // [tag]?#id.class1.class2
        if (['#', '.'].some(c=>text.startsWith(c))) { return 'div' }
        else if (['#', '.'].some(c=>text.includes(c))) { return text.substring(Math.min(...['#', '.'].map(c=>text.indexOf(c)))) }
        else { return text }
    }
    #setId(el, text) {
        if (!text.includes('#')) { return }
        console.log(text.indexOf('#')+1, text.indexOf('.'))
        el.id = text.substring(text.indexOf('#')+1, ((-1===text.indexOf('.')) ? text.length : text.indexOf('.')))
    }
    #setClass(el, text) {
        if (!text.includes('.')) { return }
        const classText = text.substring(text.indexOf('.'))
        const classTexts = classText.split('.').filter(v=>v)
        console.log(classTexts )
        for (let cls of classTexts) { el.classList.add(cls) }
    }
    #setAttr(el, parts) { // propertyname="cssproperty:value;k:v;"  スペース禁止。含めるとバグる
        for (let part of parts) {
            if (-1===part.indexOf(`="`)) { continue }
            const kv = part.split(`=`)
            const key = kv[0]
            if (!key.match(/[a-zA-Z0-9_]+/)) { continue }
            const value = kv[1].replace(/^\"/, '').replace(/\"$/, '')
            el.setAttribute(key, value)
        }
    }
    #setText(el, lastPart) { el.textContent = (lastPart.includes(`="`)) ? '' : lastPart } // =" の文字列を含められない仕様
}
window.Html = new Html()
})()
