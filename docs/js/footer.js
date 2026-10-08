(function(){
const {h1,p,br,ol,li,footer,small,time,a,img} = van.tags
class Footer {
    constructor(author, prePath) {
        this._author = ((author) ? author : 'ytyaru')
        this._created = '20261008134019'
        this._prePath = ((prePath) ? prePath : '')
        this._ccBySaUrls = ['cc','cc-by','cc-sa'].map(id=>`${this._prePath}asset/image/license/${id}.svg`)
    }
    //make() { return footer(this.#copyright(), this.#project(), this.#docLicense(), br(), this.#usedLibraries()) }
    make() { return footer(this.#copyright(), this.#project(), '　', this.#docLicense(), '　', this.#usedLibraries()) }
    #copyright() { return small('©', time({datetime:this._created}, '20261008134019'), this.#author()) }
    #author() { return a(this.#externalLinkAttr(({href:`https://github.com/${this._author}`})), img({class:'icon',src:`${this._prePath}asset/image/author/${this._author}.png`}), `${this._author}`) }
    #project() { return a(this.#externalLinkAttr(({href:`https://github.com/${this._author}/NumberId/`})), img({class:'icon', src:`${this._prePath}asset/image/logo/github/black.svg`})) }
    #docLicense() { return a(this.#externalLinkAttr(({title:'CC-BY-SA', href:'https://creativecommons.org/licenses/by-sa/4.0/deed.ja', style:'text-decoration:none;'})), this._ccBySaUrls.map(url=>img({class:'icon', src:url}))) }
    #usedLibraries() {
        const libs = [{name:'VanJS', url:'https://vanjs.org/', img:`${this._prePath}asset/image/logo/van-js/logo.svg`}]
        return libs.map(lib=>a(this.#externalLinkAttr(({href:lib.url, title:lib.name})), ((lib.hasOwnProperty('img') ? img({class:'icon', src:lib.img, alt:lib.name}) : lib.name))))
    }
    #externalLinkAttr(attr) { return Object.assign(attr, ({target:'_blank', rel:'noopener noreferrer'})) }
}
window.Footer = Footer
})()
