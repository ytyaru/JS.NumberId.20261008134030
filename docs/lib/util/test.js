(function() {
class AssertErrorResult {
    constructor(params) { this._params = params }
    get Params() { return this._params}
}
class Test {
    constructor() { this.counts = {'all':0, 'success':0, 'fail':0} }
    #getTestMethodNames() { return Object.getOwnPropertyNames(Object.getPrototypeOf(this)).filter(n=>'test'!==n && n.startsWith('test')) }
    run(tests) {
        const results = []
        this.#setHtml()
        /*
        for (let i=0; i<tests.length; i++) {
            // TypeError: 'caller', 'callee', and 'arguments' properties may not be accessed on strict mode functions or the arguments objects for calls to them
            results.push((2<=tests[i].arguments) ? this.assertError(tests[i].arguments[0], tests[i].arguments[1], tests[i]) : tests[i].call())
        }
        */
        for (let i=0; i<tests.length; i++) { results.push(tests[i].call()) }
        this.#count(results)
        this.#report(tests, results)
    }
    static assertError(e, msg, method) {
        try { method() }
        catch(err) {
            if (!(err instanceof e)) { return new AssertErrorResult([false, 'エラーの型が違う', `${err}`]) }
            if (!this._assertErrorMessage(msg, err.message)) { return new AssertErrorResult([false, 'エラーメッセージが違う', err.message]) }
            return new AssertErrorResult([true])
        }
        return new AssertErrorResult([false, 'エラーになるべき所でエラーにならなかった'])
    }
    static _assertErrorMessage(expected, actual) {
        if (this._isRegExp(expected)) { if (!expected.test(actual)) { return false } }
        else if (this._isString(expected)){ if (actual!==expected) { return false } }
        return true
    }
    static _isString(v) { return 'string'===typeof v || v instanceof String }
    static _isRegExp(v) { return v instanceof RegExp }

    assertError(e, msg, method) { return Test.assertError(e, msg, method) }
    /*
    assertError(e, msg, method) {
        try { method() }
        catch(err) {
            if (!(err instanceof e)) { return new AssertErrorResult([false, 'エラーの型が違う']) }
            if (!this.#assertErrorMessage(msg, err.message)) { return new AssertErrorResult([false, 'エラーメッセージが違う']) }
            return new AssertErrorResult([true])
        }
        return new AssertErrorResult([false, 'エラーになるべき所でエラーにならなかった'])
    }
    #assertErrorMessage(expected, actual) {
        if (this.#isRegExp(expected)) { if (!expected.test(actual)) { return false } }
        else if (this.#isString(expected)){ if (actual!==expected) { return false } }
        return true
    }
    #isString(v) { return 'string'===typeof v || v instanceof String }
    #isRegExp(v) { return v instanceof RegExp }
    */
    #count(results) {
        this.counts.all = results.length
        const ress = results.map(r=>(r instanceof AssertErrorResult) ? r.Params[0] : r)
        this.counts.success = ress.filter(r=>r).length
        this.counts.fail = ress.filter(r=>!r).length
    }
    #report(tests, results) {
        this.#reportConsoleSummary()
        this.#reportConsoleDetails(tests, results)
        this.#reportDomSummary()
        this.#reportDomDetails(tests, results)
    }
    #reportSummary() { return `全:${this.counts.all}, OK:${this.counts.success}, NG:${this.counts.fail}` }
    #reportConsoleSummary() {
        console.log(`%cテスト完了　${this.#reportSummary()}`, `color:${(0<this.counts.fail) ? 'red' : 'green'}; font-size:24px;`)
    }
    #isFail(result) { return (result instanceof AssertErrorResult) ? !result.Params[0] : !result }
    #getReportConsoleDetails(i, test, result) {
        if (result instanceof AssertErrorResult) {
            if (!result.Params[0]) { return `${i}: ${test}: ${result.Params.slice(1).join(': ')}` }
        } else if (!result) { return `${i}: ${test}` }
        return ''
    }
    #reportConsoleDetails(tests, results) {
        for (let i=0; i<tests.length; i++) {
            const msg = this.#getReportConsoleDetails(i, tests[i], results[i])
            if (msg) { console.log(`%c${msg}`, `color:red; font-size:12px;`) }
        }
    }
    #reportDomSummary() {
        const p = document.createElement('p')
        p.style.color = (0<this.counts.fail) ? 'red' : 'green'
        p.textContent = this.#reportSummary()
        document.querySelector('body').append(p)
    }
    #reportDomDetails(tests, results) {
        const table = document.createElement('table')
        for (let i=0; i<tests.length; i++) {
            if (this.#isFail(results[i])) {
                const tr = document.createElement('tr')
                const idx = document.createElement('td')
                idx.textContent = i
                idx.style.color = `blue`
                const fn = document.createElement('td')
                const code = document.createElement('code')
                code.textContent = `${tests[i]}`
                fn.append(code)
                tr.append(idx, fn, ...this.#reportDomDetailsTds(i, tests[i], results[i]))
                table.append(tr)
            }
        }
        document.querySelector('body').append(table)
    }
    #reportDomDetailsTds(i, test, result) {
        const tds = []
        if (result instanceof AssertErrorResult) {
            for (let p of result.Params.slice(1)) {
                const param = document.createElement('td')
                param.textContent = `${p}`
                param.style.color = `blue`
                tds.push(param)
            }
        }
        return tds
    }
    #setHtml() { this.#addBody(); for (let name of ['title', 'h1']) { this.#setElement(name) } }
    #getHeading() { return location.href.split('/').pop().replace(/\.html$/, '.js') + ' 単体試験' }
    #setElement(tagName) {
        const el = document.querySelector(tagName)
        if (el) { el.textContent = this.#getHeading() }
        else {
            const h1 = document.createElement(tagName)
            h1.textContent = this.#getHeading()
            document.body.insertBefore(h1, document.body.children[0])
        }
    }
    #addBody() {
        if (!document.querySelector('body')) {
            document.querySelector(':root').append(document.createElement('body'))
        }
    }
}
window.Test = Test
})()

