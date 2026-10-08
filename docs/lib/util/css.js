(function() {
class Css {
    get(key, el) { return getComputedStyle(this.#getEl(el)).getPropertyValue(key) }
    getInt(key, el) { return parseInt(this.get(key, this.#getEl(el))) }
    getFloat(key, el) { return parseFloat(this.get(key, this.#getEl(el))) }
    set(key, value, el) { return this.#getEl(el).style.setProperty(key, value) }
//    toggle(key, el) { return this.#getEl(el).classList.toggle(key) }
//    has(key, el) { return this.#getEl(el).classList.contains(key) }
    #getEl(el) {
        if (Type.isElement(el)) { return el }
        else if (Type.isString(el)) {
            const e = document.querySelector(el)
            if (e) { return e }
            else { throw new ValueError(`引数elがString型のときはdocument.querySelector()のqueryとして要素を取得できる値であるべきです。`) }
        } else { return document.querySelector(':root') }
    }
}
window.Css = new Css()
})()

