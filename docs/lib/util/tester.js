(function() {
class Tester {
    constructor(isRun) { if (isRun) { this.run() } }
    #getTestMethodNames() { return Object.getOwnPropertyNames(Object.getPrototypeOf(this)).filter(n=>'test'!==n && n.startsWith('test')) }
    run() {
        this.#setHtml()
        const names = this.#getTestMethodNames()
        for (let name of names) {
            console.debug(name)
            this[name].call(this)
        }
        console.log(`%cテスト完了！ ${names.length}`, `color:green; font-size:24px;`)
    }
    assertError(method, obj, args, e, msg) {
        try { method.call(obj, ...args) }
        catch(err) {
            console.assert(err instanceof e)
            //console.debug(err.message, msg)
            console.assert(err.message===msg)
            return
        }
        throw new Error('エラーになるべき所でエラーにならなかった')
    }
    #setHtml() { for (let name of ['title', 'h1']) { this.#setElement(name) } }
    #getHeading() { return location.href.split('/').pop().replace(/\.html$/, '.js') + ' 単体試験' }
    #setElement(tagName) {
        const el = document.querySelector(tagName)
        if (el) { el.textContent = this.#getHeading() }
        else {
            const h1 = document.createElement(tagName)
            h1.textContent = this.#getHeading()
            if (document.body) { document.body.insertBefore(h1, document.body.children[0]) }
        }
    }
}
window.Tester = Tester
})()

