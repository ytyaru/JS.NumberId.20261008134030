(function() {
function isStr (v) { return typeof v === 'string' || v instanceof String }
function isStrs(v) { return Array.isArray(v) && v.every(x=>isStr(x)) }
class Id {
    constructor(names) { this._names = names }
    get names() { return this._names }
    match(names) {
//        console.log(names, this._names)
             if (isStr (names) && isStr (this._names)) { return this._names===names }
        else if (isStr (names) && isStrs(this._names)) { return this._names.some(t=>t===names) }
        else if (isStrs(names) && isStr (this._names)) { return names.some(t=>t===this._names) }
        else if (isStrs(names) && isStrs(this._names)) {
            for (let typ of names) {
                for (let t of this._names) {
                    if (t===typ) { return true }
                }
            }
            return false
        }
        throw new Error(`引数namesは文字列または文字列の配列であるべきです。:${typeof names}: ${names}`)
    }
}
class TypeParser extends Id {
    constructor(names) { super(names) }
    is(val) {
        if (isStr (this._names)) { return typeof val===this._names }
        if (isStrs(this._names)) { return typeof val===this._names[0] }
        return false
    }
    parse(str) { throw new Error(`未実装`) }          // 文字列型から自型へ
    stringify(val) { return val.toString() }          // 自型から文字列型型へ
    to(typeName, val) { throw new Error(`未実装`) }   // 自型からtypeName型へ
    from(typeName, val) { throw new Error(`未実装`) } // typeName型から自型へ
    /*
    to(typeName, val) {
        if (!this.is(val)) { throw new Error(`値の型が不一致です。実際値:${val}, 期待値:${this.names}`) }
        const parser = ((Type.isStr(typeName)) ? Type.parsers.get(typeName) : ((typeName instanceof TypeParser) ? typeName : null))
    }
    */
}
class FixTypeParser extends TypeParser {
    constructor(type) { super(String(type)); this._type=type; }
    is(val) { console.log(val, this._type);return val===this._type }
    parse(str) { return this._type }
    stringify(val) { return String(this._type) }
}
class UndefinedParser extends FixTypeParser { constructor(type=undefined) { super(type) } }
class NullParser extends FixTypeParser { constructor(type=null) { super(type) } }

class ArrayParser extends TypeParser {
    constructor(names='array,ary'.split(',')) { super(names) }
    is(v) { return Array.isArray(v) }
//    parse(str, to='string', delim=',') {
//        const parser = Type.parsers.get(to)
//        const strs = str.split(delim)
//        if (StringParser===parser.constructor) { return strs }
//        return strs.map(s=>parser.parse(s))
//    }
//    stringify(val, delim=',') { return val.join(delim) }
//    parse(str) { return JSON.parse(str) }
    parse(str, to='string', delim=',') {
        const s = str.trim()
        if (s.startsWith('[') && s.endsWith(']')) { return JSON.parse(str) }
        return this.#parseNoSquareBrackets(str, to, delim)
    }
    #parseNoSquareBrackets(str, to='string', delim=',') {
        const parser = Type.parsers.get(to)
        const strs = str.split(delim)
        if (StringParser===parser.constructor) { return strs }
        return strs.map(s=>parser.parse(s))
    }
    stringify(val) { return JSON.stringify(val) }
//    #stringifyNoSquareBrackets(val, delim=',') { return return val.join(delim) }
    to(typeName, val) { // to('object', [['k1','v1'],['k2','v2']]) -> {k1:'v1', k2:'v2'}
//        const parser = Type.parsers.get(typeName)
        const parser = ((Type.isStr(typeName)) ? Type.parsers.get(typeName) : ((typeName instanceof TypeParser) ? typeName : null))
        if (ObjectParser===parser.constructor) {
            //if (!parser.is(val)) { throw new Error(`to()の第一引数と第二引数が不一致です。第一に型名、第二に値を与え、一致させてください。例：to('array', [['k1','v1'],['k2','v2']]): ${typeName}, ${val}`) }
            //if (!parser.is(val)) { throw new Error(`to()の第一引数と第二引数が不一致です。第一に型名、第二に値を与え、一致させてください。例：to('object', {k:'v'}): ${typeName}, ${val}`) }
            //if (!this.is(val)) { throw new Error(`to()の第一引数と第二引数が不一致です。第一に型名、第二に値を与え、一致させてください。例：to('object', [['k1','v1'],['k2','v2']]): ${typeName}, ${val}`) }
//            return Object.assign(...val.map(([k,v])=>({[k]:v})))
//            const obj = {};
//            for (const [k,v] of val) { obj[k] = v }
//            return obj
            return Object.assign(...val.map(([k,v])=>({[k]:v})))
        }
    }
    from(typeName, val) { // from('object', {k1:'v1', k2:'v2'}) -> [['k1','v1'],['k2','v2']]
        const parser = ((Type.isStr(typeName)) ? Type.parsers.get(typeName) : ((typeName instanceof TypeParser) ? typeName : null))
        if (ObjectParser===parser.constructor) {
            return Array.from(Object.entries()).reduce((o,[k,v],i)=>[k,v], [])
        }
    }
}
class ObjectParser extends TypeParser {
    constructor(names='object,obj'.split(',')) { super(names) }
    is(v) {
        if (!ObjectParser.isObjectLike(v) || ObjectParser.getTag(v) != '[object Object]') { return false }
        if (Object.getPrototypeOf(v) === null) { return true }
        let proto = v
        while (Object.getPrototypeOf(proto) !== null) { proto = Object.getPrototypeOf(proto) }
        return Object.getPrototypeOf(v) === proto
    }
    static isObjectLike(v) { return typeof v === 'object' && v !== null }
    static getTag(v) { return (v == null) ? (v === undefined ? '[object Undefined]' : '[object Null]') : toString.call(v) }
    //parse(str) { return eval?.(`"use strict";(${str})`) } }
    parse(str, format='object') {
        switch(format) {
            case 'object': return eval?.(`"use strict";(${str})`)
            case 'json': return JSON.parse(str)
            case 'yaml': return jsyaml.load(str)
            case 'toml': throw new Error(`未実装`)
            case 'xml':  throw new Error(`未実装`)
            case 'csv':  throw new Error(`未実装`)
            case 'tsv':  throw new Error(`未実装`)
            case 'ssv':  throw new Error(`未実装`)
            default: return JSON.parse(str)
        }
    }
    stringify(val, format='object') {
        switch(format) {
            case 'object': return JSON.stringify(val)
            case 'json': return JSON.stringify(val)
            case 'yaml': return jsyaml.dump(str)
            case 'toml': throw new Error(`未実装`)
            case 'xml':  throw new Error(`未実装`)
            case 'csv':  throw new Error(`未実装`)
            case 'tsv':  throw new Error(`未実装`)
            case 'ssv':  throw new Error(`未実装`)
            default: return JSON.stringify(val)
        }
    }
    to(typeName, val) { // to('array', {k1:'v1', k2:'v2'}) -> [['k1','v1'],['k2','v2']]
        const parser = ((Type.isStr(typeName)) ? Type.parsers.get(typeName) : ((typeName instanceof TypeParser) ? typeName : null))
        if (ArrayParser===parser.constructor) {
            //if (!parser.is(val)) { throw new Error(`to()の第一引数と第二引数が不一致です。第一に型名、第二に値を与え、一致させてください。例：to('array', [['k1','v1'],['k2','v2']]): ${typeName}, ${val}`) }
            //if (!parser.is(val)) { throw new Error(`to()の第一引数と第二引数が不一致です。第一に型名、第二に値を与え、一致させてください。例：to('object', {k:'v'}): ${typeName}, ${val}`) }
//            Array.from(Object.entries(val)).reduce((o,[k,v],i)=>o[k]=v, {})
//            return Object.assign(...val.map(([k,v])=>({[k]:v})))
//            const obj = {};
//            for (const [k,v] of val) { obj[k] = v }
//            return obj
            //return Object.assign(...val.map(([k,v])=>({[k]:v})))
            return Array.from(Object.entries(val))
        }
        else if (MapParser===parser.constructor) { return new Map(Object.entries(val)) }
        else if (SetParser===parser.constructor) { return new Set(Object.entries(val)) }
//        else if (WeakMapParser===parser.constructor) { return new WeakMap(Object.entries(val)) }
//        else if (WeakSetParser===parser.constructor) { return new WeakSet(Object.entries(val)) }
    }
    from(typeName, val) {
        const parser = ((Type.isStr(typeName)) ? Type.parsers.get(typeName) : ((typeName instanceof TypeParser) ? typeName : null))
        if (ArrayParser===parser.constructor) { return Object.assign(...val.map(([k,v])=>({[k]:v}))) }
        else if (MapParser===parser.constructor) { return new Map(Array.from(val.entries())) }
        else if (SetParser===parser.constructor) { return new Set(Array.from(val.entries())) }
//        else if (WeakMapParser===parser.constructor) { return new WeakMap(Array.from(val.entries())) }
//        else if (WeakSetParser===parser.constructor) { return new WeakSet(Array.from(val.entries())) }
    }
}
// class Dsv,Csv,Tsv,Ssv,Scsv,Clsv,  Ltsv, Json,Yaml,Toml,Xml
class JsonParser extends TypeParser {
    constructor(names='json') { super(names) }
    is(v) { try { JSON.parse(v); return true; } catch(e) { console.warn(e); return false; } }
    parse(str) { return JSON.parse(str) }
    stringify(val) { return JSON.stringify(val) }
}
class YamlParser extends TypeParser {
    constructor(names='yaml') { super(names) }
    is(v) { if (Type.isStr(v)) { try { jsyaml.load(str); return true; } catch(e) { return false } } }
    parse(str) { return jsyaml.load(str) }
    stringify(val) { return jsyaml.dump(val) }
}
//Map, Set, WeakMap, WeakSet
//class MapParser extends TypeParser {
class MapParser extends ObjectParser {
    constructor(names='map') { super(names) }
    is(v) { return v instanceof Map }
    //parse(str) { return new Map(Type.parsers.get('object').to('array', JSON.parse(str))) }
    //stringify(val) { return Type.parsers.get('array').to('object', Array.from(val.entries())) }
    //stringify(val) { return super.stringify(val) }
    //parse(str) { return new Map(Type.parsers.get('object').parse(str).entries()) }
    parse(str) { return new Map(Object.entries(Type.parsers.get('object').parse(str))) }
    stringify(val) {
        if (!this.is(val)) { throw new TypeError(`引数の型はMapのみ有効です。`) }
        return JSON.stringify(Object.fromEntries(val))
    }
    to(typeName, val) { // to('object', [['k1','v1'],['k2','v2']]) -> {k1:'v1', k2:'v2'}
        const parser = ((Type.isStr(typeName)) ? Type.parsers.get(typeName) : ((typeName instanceof TypeParser) ? typeName : null))
        if (ObjectParser===parser.constructor) { return Object.fromEntries(val) }
        else if (ArrayParser===parser.constructor) { return Array.from(val.entries()) }
    }
    from(typeName, val) { // from('object', {k1:'v1', k2:'v2'}) -> [['k1','v1'],['k2','v2']]
        const parser = ((Type.isStr(typeName)) ? Type.parsers.get(typeName) : ((typeName instanceof TypeParser) ? typeName : null))
        if (ObjectParser===parser.constructor) { return new Map(val.entries()) }
        else if (ArrayParser===parser.constructor) { return new Map(val) }
//        else if (SetParser===parser.constructor) { return Array.from(val.entries()) }
//        if (ObjectParser===parser.constructor) { return parser.from('array', Array.from(val.entries())) }
//        else if (ArrayParser===parser.constructor) { return Array.from(val.entries()) }
//        else if (SetParser===parser.constructor) { return Array.from(val.entries()) }
//        else if (WeakMapParser===parser.constructor) { return Array.from(val.entries()) }
//        else if (WeakSetParser===parser.constructor) { return Array.from(val.entries()) }
    }
}
class SetParser extends TypeParser {
    constructor(names='set') { super(names) }
    is(v) { return v instanceof Set }
    parse(str) { return new Set(JSON.parse(str)) }
    stringify(val) {
        if (!this.is(val)) { throw new TypeError(`引数の型はSetのみ有効です。`) }
        return JSON.stringify(Array.from(val))
    }
//    parse(str) { return new Set(Type.parsers.get('object').to('array', JSON.parse(str))) }
//    stringify(val) { return Type.parsers.get('array').to('object', Array.from(val.entries())) }
    to(typeName, val) { // to('object', [['k1','v1'],['k2','v2']]) -> {k1:'v1', k2:'v2'}
        const parser = ((Type.isStr(typeName)) ? Type.parsers.get(typeName) : ((typeName instanceof TypeParser) ? typeName : null))
        if (ObjectParser===parser.constructor) { return parser.from('array', Array.from(val.entries())) }
        else if (ArrayParser===parser.constructor) { return Array.from(val.entries()) }
        else if (SetParser===parser.constructor) { return Array.from(val.entries()) }
//        else if (WeakMapParser===parser.constructor) { return new WeakMap()Array.from(val.entries()) }
//        else if (WeakSetParser===parser.constructor) { return Array.from(val.entries()) }
    }
    from(typeName, val) { // from('object', {k1:'v1', k2:'v2'}) -> [['k1','v1'],['k2','v2']]
        const parser = ((Type.isStr(typeName)) ? Type.parsers.get(typeName) : ((typeName instanceof TypeParser) ? typeName : null))
        if (ObjectParser===parser.constructor) { return parser.from('array', Array.from(val.entries())) }
        else if (ArrayParser===parser.constructor) { return Array.from(val.entries()) }
        else if (SetParser===parser.constructor) { return Array.from(val.entries()) }
//        else if (WeakMapParser===parser.constructor) { return Array.from(val.entries()) }
//        else if (WeakSetParser===parser.constructor) { return Array.from(val.entries()) }
    }
}

class BooleanParser extends TypeParser {
    constructor(names='boolean,bool,bln,b'.split(',')) { super(names) }
    parse(str) { return 'true,t,1'.split(',').some(v=>v===str.toLowerCase()) }
    stringify(val) { return ((Type.isInt(val)) ? (1===val) : ('true,t'.split(',').some(v=>v===String(val).toLowerCase()))).toString() }
}
class NumberParser extends TypeParser {
    constructor(names='number,num'.split(',')) { super(names) }
    is(v) { return ('number'===typeof v && !isNaN(v)) || (ObjectParser.isObjectLike(v) && ObjectParser.getTag(v)=='[object Number]') } // https://github.com/lodash/lodash/blob/master/isNumber.js
    parse(str) { return Number(str) }
}
class IntegerParser extends NumberParser {
    constructor(names='integer,int,i'.split(','), base=10) { super(names); this._base=base; }
    is(v)   { return super.is(v) && v % 1 === 0 }
    parse(str) { return parseInt(str, this._base) }
    stringify(val) { return val.toString(this._base) }
}
class BinParser extends IntegerParser { constructor(names='binary,bin'.split(',')) { super(names, 2) } }
class OctParser extends IntegerParser { constructor(names='octral,oct'.split(',')) { super(names, 8) } }
class HexParser extends IntegerParser { constructor(names='hex') { super(names, 16) } }
class Base32Parser extends IntegerParser { constructor(names='base32') { super(names, 32) } }
class Base36Parser extends IntegerParser { constructor(names='base36') { super(names, 36) } }
class StringParser extends TypeParser {
    constructor(names='string,str,s'.split(',')) { super(names) }
    static is (v) { return typeof v === 'string' || v instanceof String }
    static iss(v) { return Array.isArray(v) && v.every(x=>isStr(x)) }
    is(v) { return StringParser.is(v) }
    parse(str) { return ((str.hasOwnProperty('toString')) ? str.toString() : String(str)) }
    stringify(val) { return this.parse(val) }
    to(typeName, val) {
        const parser = ((Type.isStr(typeName)) ? Type.parsers.get(typeName) : ((typeName instanceof TypeParser) ? typeName : null))
        if (Base64Parser===parser.constructor) { return new TextDecoder().decode(new Uint8Array(Array.prototype.map.call(atob(val), c=>c.charCodeAt()))) }
    }
    from(typeName, val) {
        const parser = ((Type.isStr(typeName)) ? Type.parsers.get(typeName) : ((typeName instanceof TypeParser) ? typeName : null))
        if (Base64Parser===parser.constructor) { return btoa(String.fromCharCode.apply(null, new TextEncoder().encode(str))) }
    }
//    parse(str) { return btoa(String.fromCharCode.apply(null, new TextEncoder().encode(str))) }
//    stringify(val) { return new TextDecoder().decode(new Uint8Array(Array.prototype.map.call(atob(val), c=>c.charCodeAt()))) }
}
class Base64Parser extends StringParser {
    constructor(names='base64') { super(names) }
    parse(str) { return btoa(String.fromCharCode.apply(null, new TextEncoder().encode(str))) } // string->base64
    //stringify(val) { return new TextDecoder().decode(new Uint8Array(Array.prototype.map.call(atob(val), c=>c.charCodeAt()))) } // base64->string
    stringify(val) { return new TextDecoder().decode(new Uint8Array(Array.prototype.map.call(atob(val), c=>c.charCodeAt()))) } // base64->string
//    parse(str) { return Uint8Array.from(Array.prototype.map.call(atob(str), x=>x.charCodeAt(0))) } // str -> Uint8Array
//    stringify(val) { return btoa(String.fromCharCode(...val)) } // Uint8Array -> str
    dataUrl(val, mime, isBase64) {
        const m = ((mime) ? mime : '')
        const b = ((isBase64) ? ';base64' : '')
        const base64 = ((Type.isStr(val)) ? val : ((val instanceof Uint8Array) ? this.stringify(val) : ''))
        return `data:${m}${b},${base64}`
    }
    /*
    to(typeName, val) { // base64->binary(utf8,ascii)->string(utf16)
        const parser = ((Type.isStr(typeName)) ? Type.parsers.get(typeName) : ((typeName instanceof TypeParser) ? typeName : null))
        //if (Base64Parser===parser.constructor && Type.isStr(val)) {
        if (StringParser===parser.constructor && Type.isStr(val)) {
            return new TextDecoder().decode(new Uint8Array(Array.prototype.map.call(atob(val), c=>c.charCodeAt())))
        }
        if (StringParser===parser.constructor && val instanceof Uint8Array) { return btoa(String.fromCharCode.apply(null, new TextEncoder().encode(str))) }
    }
    from(typeName, val) {

    }
    */
}
class FloatParser extends NumberParser {
    constructor(names='float,flt,f'.split(',')) { super(names); }
    is(v) { return super.is(v) && (v % 1 !== 0 || 0===v) }
    parse(str) { return parseFloat(str) }
}
class BigIntParser extends TypeParser {
    constructor(names='bigint,BigInt,bi'.split(',')) { super(names) }
    parse(str) { return BigInt(str) }
}
//class DataUrlParser extends Base64Parser {
class DataUrlParser extends Base64Parser {
//    constructor(names='dataurl,DataUrl') { super(names); this._regex = /data:(.+/.+)?(;base64)?,([a-zA-Z0-9\+/=]+)/; }
    //constructor(names='dataurl,DataUrl') { super(names); this._regex = /data:(*/*)?(;base64)?,([a-zA-Z0-9\+/=]+)/; }
//    constructor(names='dataurl,DataUrl') { super(names); this._regex = /data:(*)?(;base64)?,([a-zA-Z0-9\+/=]+)/; }
//    constructor(names='dataurl,DataUrl') { super(names); this._regex = /data:(?<mime>[\w/-\.]+])(;)?(<encoding>\w+),(?<data>.*)/; }
    //constructor(names='dataurl,DataUrl') { super(names); this._regex = /data:(?<mime>[\w/\-\.]+);(?<encoding>\w+),(?<data>.*)/; }
//    constructor(names='dataurl,DataUrl') { super(names); this._regex = /data:(?<mime>[\w/\-\.]+)(;base64)?,(?<data>.*)/; }
    //constructor(names='dataurl,DataUrl'.split(',')) { super(names); this._regex = /data:(?<mime>[\w/\-\.]+)(?<encoding>;\w+),(?<data>.*)/; }
    constructor(names='dataurl,DataUrl'.split(',')) { super(names); this._regex = /data:(?<mime>[\w/\-\.]+)?(?<encoding>;\w+)?,(?<data>.*)/; }
    //is(v) { if (!Type.isStr(v)) {return false} return v.match(this._regex) }
    is(v) { return ((Type.isStr(v)) ? v.match(this._regex) : false) }
//var regex = new Regex(@"data:(?<mime>[\w/\-\.]+);(?<encoding>\w+),(?<data>.*)", RegexOptions.Compiled);
    /*
    parse(str) { // str:base64  return Blob
        const m = this.is(str)
        if (!m) { throw new Error(`書式エラー。引数値はDataUrl形式ではありません。次の書式に一致させてください。:${this._regex}\n\n${str}`) }
        const mimeType = m[1]
        const isBase64 = m[2]
        const data = m[3]
        // 平文（text/plain & UrlEncoding）「data:,Hello%2C%20World!」
        // Base64 「data:text/plain;base64,SGVsbG8sIFdvcmxkIQ==」
//        if (!mimeType && !isBase64) { return encodeURIComponent(data) }
//        return new Blob(new Uint8Array(), mimeType)
        console.log(mimeType, isBase64, data)
        console.log((!mimeType && !isBase64))
        console.log(encodeURIComponent(data))
        console.log(btoa(data))
//        console.log(atob(data))
        console.log(btoa(String.fromCharCode.apply(null, new TextEncoder().encode(data))))

        console.log(new Uint8Array(Array.prototype.map.call(atob(data), c=>c.charCodeAt())))
        return new Blob(((!mimeType && !isBase64) ? encodeURIComponent(data) : new Uint8Array(Array.prototype.map.call(atob(data), c=>c.charCodeAt()))) , {type:mimeType})
    }
    async stringify(val) { // val:Blob  return DataUrlStr
        if (!(val instanceof Blob)) { throw new TypeError(`引数の型はBlobであるべきです。`) }
        const mimeType = val.type || 'text/plain'
        const buf = await val.arrayBuffer()
        const data = super.stringify(buf)
        return `data:${mimeType};base64,${data}`
//        const data = ((mimeType) ? super.stringify(buf) : encodeURIComponent(data))
    }
    */
    async parseAsync(dataUrl) { return await (await fetch(dataUrl)).blob() }
    async stringifyAsync(blob) { return await new Promise((resolve, reject) => {
        const fr = new FileReader()
        const subscribe = () => {
            fr.addEventListener('abort', onAbort)
            fr.addEventListener('error', onError)
            fr.addEventListener('load', onLoad)
        }
        const unsubscribe = () => {
            fr.removeEventListener('abort', onAbort)
            fr.removeEventListener('error', onError)
            fr.removeEventListener('load', onLoad)
        }
        const onAbort = () => {
            unsubscribe()
            reject(new Error('abort'))
        }
        const onError = (event) => {
            unsubscribe()
            reject(event.target.error)
        }
        const onLoad = (event) => {
            unsubscribe()
            resolve(event.target.result)
        }
        subscribe()
        fr.readAsDataURL(blob)
    })}
}
class BlobParser extends DataUrlParser {
    constructor(names='blob') { super(names) }
    is(v) { return v instanceof Blob }
    async parseAsync(dataUrl) { return await super.parseAsync(dataUrl) }
    async stringifyAsync(blob) { return await super.stringifyAsync(blob) }
}
class SymbolParser extends TypeParser {
    constructor(names='symbol,sym'.split(',')) { super(names) }
    parse(str) { return Symbol(str) }
}
class FunctionParser extends TypeParser {
    constructor(names='function,func,fnc,fn'.split(',')) { super(names) }
    parse(str, params) { return ((isStrs(params)) ? new Function(...params, str) : new Function(str)) }
}
class ClassParser extends TypeParser {
    constructor(names='class,cls'.split(',')) { super(names) }
    //is(val) { console.log(super.is(val), typeof val, val); return (super.is(val) && val.new.target) }
    //is(val) { console.log(val, typeof val, super.is(val)); return super.is(val) }
    is(val) { return 'function'===typeof val && val.toString().match(/^class /) }
    parse(str) { return Function(`return (${str})`)() }
    //parse(str) { return this.#getClass(str) }
    //#getClass(className) { return Function(`return (${className})`)() }
    //#getClass(name) { return Function('return (' + classname + ')')() }
    getClass(className) { return Function(`return (${className})`)() }
}
class InstanceParser extends TypeParser {
    constructor(names='instance,ins'.split(',')) { super(names); this._clsP=new ClassParser(); }
    is(v, cls) { console.log(v, cls); return (v instanceof cls) }
    //is(v) { return v instanceof cls }
    /*
    is(v) {
        console.log(v)
        if (undefined===v || null===v) { return false }
        console.log(`v.hasOwnProperty('constructor'):`, v.hasOwnProperty('constructor'), v.constructor.name)
//        console.log(`v.prototype.hasOwnProperty('constructor'):`, v.prototype.hasOwnProperty('constructor'), v.constructor.name)
        //if (!v.hasOwnProperty('constructor')) { return false }
//        if (!v.prototype.hasOwnProperty('constructor')) { return false }
        if (!Type.isStr(v.constructor.name)) { return false }
//        if (!v.hasOwnProperty('new')) { return false }
//        if (!v.new.target) { return false }
        //return v instanceof this._clsP.getClass(v.constructor.name)
        return v instanceof v.constructor
    }
    */
    parse(str, params) {
        console.log(str, params)
        const cls = this._clsP.parse(str)
        return ((Array.isArray(params)) ? new cls(...params) : new cls()) 
    }
    stringify(val) { return `[object ${val.constructor.name}]` }
}
class DateTimeParser extends TypeParser { // day.js/date-fns  Temporalが実装されるまでの間どうするか。文字列として扱うか
    constructor(names='datetime,DateTime,dt'.split(',')) { super(names); this._regex = /\d{4,}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/; }
    is(v) { return v && v.getMonth && typeof v.getMonth === 'function' && Object.prototype.toString.call(v) === '[object Date]' && !isNaN(v) } // https://stackoverflow.com/questions/643782/how-to-check-whether-an-object-is-a-date
    parse(str) {
        //if (this._regex.match(str)) { return new Date(str) }
        if (str.match(this._regex)) { return new Date(str) }
        throw new Error(`引数エラー。引数の文字列 ${str} は日付に変換できませんでした。書式 ${this._regex} に従ってください。`)
    }
    stringify(val, s1='-', s2='T', s3=':') {
        console.log(val)
        if (!this.is(val)) { throw new Error(`引数型エラー。引数の型はDate型であるべきです。: ${typeof val} : ${val}`) }
        console.log(val)
        const [y,m,d,H,M,S] = this.getYmdHmsStr(val)
        return `${y}${s1}${m}${s1}${d}${s2}${H}${s3}${M}${s3}${S}`
    }
    getYmdHms(val) { console.log(val);return [
        val.getFullYear(),
        val.getMonth() + 1,
        val.getDate(),
        val.getHours(),
        val.getMinutes(),
        val.getSeconds(),
    ]}
    getYmdHmsStr(val) { console.log(val);return this.getYmdHms(val).map((v,i)=>(0===i) ? v.toString() : v.toString().padStart(2,'0')) }
}
class DateParser extends DateTimeParser { // day.js/date-fns  Temporalが実装されるまでの間どうするか。文字列として扱うか
    constructor(names='date') { super(names); this._regex = /\d{4,}-\d{2}-\d{2}/; }
    parse(str) {
        //if (this._regex.match(str)) { return new Date(`${str}T00:00:00`) }
        if (str.match(this._regex)) { return new Date(`${str}T00:00:00`) }
        throw new Error(`引数エラー。引数の文字列 ${str} は日付に変換できませんでした。書式 ${this._regex} に従ってください。`)
    }
    stringify(val, _='-') {
        if (!this.is(val)) { throw new Error(`引数型エラー。引数の型はDate型であるべきです。: ${typeof val} : ${val}`) }
        const [y,m,d,H,M,S] = super.getYmdHmsStr(val)
        return `${y}${_}${m}${_}${d}`
    }
}
class TimeParser extends DateTimeParser { // day.js/date-fns  Temporalが実装されるまでの間どうするか。文字列として扱うか
    constructor(names='time') { super(names); this._regex = /\d{2}:\d{2}:\d{2}/; }
    parse(str) {
        //if (this._regex.match(str)) { return new Date(`2000-01-01T${str}`) }
        if (str.match(this._regex)) { return new Date(`2000-01-01T${str}`) }
        throw new Error(`引数エラー。引数の文字列 ${str} は日付に変換できませんでした。書式 ${this._regex} に従ってください。`)
    }
    stringify(val, _=':') {
        if (!this.is(val)) { throw new Error(`引数型エラー。引数の型はDate型であるべきです。: ${typeof val} : ${val}`) }
        const [y,m,d,H,M,S] = super.getYmdHmsStr(val)
        return `${H}${_}${M}${_}${S}`
    }
}
class DurationParser extends TypeParser { // day.js/date-fns  Temporalが実装されるまでの間どうするか。文字列として扱うか
    constructor(names='duration,dur'.split(',')) { super(names); this._regex = /P(\d{1,}Y)?(\d{1,}M)?(\d{1,}D)?(T)?(\d{1,}H)?(\d{1,}M)?(\d{1,}S)?/; }
    is(v) {
        if (Type.isStr(v)) { return v.match(this._regex) }
        //if (Type.isStr(v)) { return this._regex.match(v) }
        if (Type.isObj(v)) { return 'y,m,d,H,M,S'.split(',').some(k=>v.hasOwnProperty(k) && Type.isInt(v[k])) }
        return false
    }
    parse(str) {
        const m = str.match(this._regex)
        console.log(m)
        if (m) { return this.values(m) }
//        if (m) { return {y:m[1], m:m[2], d:m[3], H:m[4], M:m[5], S:m[6]} }
        throw new Error(`引数エラー。引数の文字列 ${str} は期間に変換できませんでした。書式 ${this._regex} に従ってください。`)
    }
    //values(m) { return 'y,m,d,T,H,M,S'.split(',').reduce((o,k,i)=>{o[k]=parseInt(m[i+1]);return o;}, {str:m[0]}) }
    values(m) { const obj='y,m,d,T,H,M,S'.split(',').reduce((o,k,i)=>{o[k]=parseInt(m[i+1]);return o;}, {str:m[0]}); delete obj.T; return obj; }
    /*
    //values(m) { return 'y,m,d,H,M,S'.split(',').reduce((o,k,i)=>o[k]=m[i+1], {}) }
    //values(m) { console.log(m, m[1]);return 'y,m,d,H,M,S'.split(',').reduce((o,k,i)=>o[k]=parseInt(m[i+1]), {}) }
    values(m) {
        console.log(m, m[1]);
        return 'y,m,d,H,M,S'
                .split(',')
                .reduce((o,k,i)=>{console.log(o,k,i);o[k]=parseInt(m[i+1]);return o;},
                //.reduce((o,k,i)=>o[k]=1,
                ({}))
    }
    */
    stringify(v) {
        const T = (('H,M,S'.split(',').some(k=>v.hasOwnProperty(k))) ? 'T' : '')
        const ymd = 'y,m,d'.split(',').map(k=>((v.hasOwnProperty(k)) ? v[k]+k.toUpperCase() : '')).join('')
        const hms = 'H,M,S'.split(',').map(k=>((v.hasOwnProperty(k)) ? v[k]+k.toUpperCase() : '')).join('')
        return `P${ymd}${T}${hms}`
    }
}
class ColorParser extends TypeParser {
    constructor(names='color,clr'.split(',')) { super(names) }
    is(val) { return val.hasOwnProperty('_rgb') }
    parse(str) { return chroma(str) }
    stringify(val) { return val.hex() }
}
class DecimalParser extends TypeParser {
    constructor(names='decimal,dec'.split(',')) { super(names) }
    is(v) { return Decimal.isDecimal(v) }
    parse(str) { return new Decimal(str) }
}
class TypeParsers {
    constructor() {this._parsers=[];}
    get parsers() { return this._parsers }
    get names() { return this.parsers.map(p=>p.names).flat() }
    add(parser) {
        if (this.parsers.some(p=>p.match(parser.names))) { throw new Error(`追加失敗。指定パーサ ${parser.constractor.name} の names ${parser.names} は既存パーサと重複しています。`) }
        //if (this._parsers.match(parser.names)) { throw new Error(`追加失敗。指定パーサ ${parser.constractor.name} の names ${parser.names} は既存パーサと重複しています。`) }
        this._parsers.push(parser)
    }
    get(typeName) {
        const parsers = this._parsers.filter(p=>p.match(typeName))
        if (1===parsers.length) { return parsers[0] }
        if (0===parsers.length) { return null }
        if (1<parsers.length) { throw new Error(`論理エラー。typeName:${typeName}に一致するパーサが複数あります。`) }
    }
    getFromValue(v) {
        for (let type of 'undefined,null,bool,int,float,bigint,num,dt,sym,fn,str,obj,ary,blob,DataUrl,color'.split(',')) {
            const parser = this.get(type)
            if (parser.is(v)) { return parser }
//            if (this.is(type, v)) { return this.get(type) }
        }
        return null
    }
}
class TypeClass {
    constructor(parsers) { this._parsers=new TypeParsers(); }
    get parsers() { return this._parsers }
    is(typeName, value) { return this._parsers.get(typeName).is(value) }
//    parse(typeName, value) { return this._parsers.get(typeName).parse(value) }
//    stringify(typeName, value) { return this._parsers.get(typeName).stringify(value) }
//    to(to, value, from) { this._parses.get(to).to(value, from) }

    //parse(to, v) { return this.parsers.get(to).parse(v) }
    parse(to, v, ...params) {
//        console.log(this, this.parsers)
        const parser = this.parsers.get(to)
        console.log(parser)
        if (!Type.isStr(v)) { throw new TypeError(`parse()の第二引数の型は文字列型にしてください。: ${(typeof v)} ${v}`) }
        return parser?.parse(v, ...params)
    }
    stringify(v, from) {
        const parser = ((from) ? this.parsers.get(from) : this.parsers.getFromValue(v))
        if (!parser) { throw new Error(`stringify()の第二引数で第一引数の型名を指定してください。（値の型が${'undefined,null,bool,int,float,bigint,num,dt,sym,fn,str,obj,ary,blob,DataUrl,color'.split(',')}のいずれかであれば型名を省略できます）`) }
        console.log(v)
        console.log(parser)
        console.log(parser, parser.stringify(v))
        return parser.stringify(v)
    }
    to(to, v, from) {
        const toP = this.parsers.get(to)
        const fromP = ((from) ? this.parsers.get(from) : this.parsers.getFromValue(v))
        if (!toP) { throw new Error(`to()の第一引数に変換したい型名を入力してください: ${to}`) }
        if (fromP) {
            //if (toP instanceof StringParser) { return fromP.stringify(v) }
            if (StringParser===toP.constructor) { return fromP.stringify(v) }
            if (!fromP.is(v)) { throw new Error(`第二引数の値とその型名第三引数が不一致です。${v} : ${from}`) }
            return fromP.to(toP, v)
        } else { throw new Error(`to()の第三引数fromを指定してください。（値の型が${'undefined,null,bool,int,float,bigint,num,dt,sym,fn,str,obj,ary'.split(',')}のいずれかであれば型名を省略できます）`) }
        //if (!fromP) { throw new Error(`to()の第三引数で第二引数の型名を指定してください。（値の型が${'undefined,null,bool,int,float,bigint,num,dt,sym,fn,str,obj,ary'.split(',')}のいずれかであれば型名を省略できます）`) }
        /*
        if (toP instanceof StringParser) { return toP.stringify(v, from) }
        if (from) {
            const fromP = this.parsers.get(from)
        }
        const parser = ((to) ? this.parsers.get(to) : this.parsers.getFromValue(v))
        */
    }
    async parseAsync(to, v, params) {
        const parser = this.parsers.get(to)
        console.log(parser)
        //if (!Type.isStr(v)) { throw new TypeError(`parse()の第二引数の型は文字列型にしてください。: ${(typeof v)} ${v}`) }
        return await parser?.parseAsync(v, params)
    }
    async stringifyAsync(v, from) {
        const parser = ((from) ? this.parsers.get(from) : this.parsers.getFromValue(v))
        if (!parser) { throw new Error(`stringify()の第二引数で第一引数の型名を指定してください。（値の型が${'undefined,null,bool,int,float,bigint,num,dt,sym,fn,str,obj,ary'.split(',')}のいずれかであれば型名を省略できます）`) }
        return await parser.stringifyAsync(v)
    }

    /*
    getType(v) {
        const type = this.getFromValue(v)
        switch (v) {
            case 
        }
    }
    #getType(v) {
        for (let type of 'undefined,null,bool,int,float,bigint,num,dt,sym,fn,str,obj,ary'.split(',')) {
            if (this.is(type, v)) { return this.parsers.get(type) }
        }
        ['int','float','num','','','','','','','','','','']
        this.is(type, v)
        if (Type.isInt(v)) { return 
    }
    */
    /*
    to(to, value, from) { return 
        const toP = this._parses.get(to)
        if (from) {
            const fromP = this._parses.get(from)
            if (fromP && fromP.is(value)) {
                //return toP.parse(fromP.stringify(value))
                return toP.parse(value, from)
            }
        }
            
        value
    }
    */
}
const type = new TypeClass()
type.parsers.add(new UndefinedParser())
type.parsers.add(new NullParser())
type.parsers.add(new ObjectParser())
type.parsers.add(new JsonParser())
type.parsers.add(new YamlParser())
type.parsers.add(new ArrayParser())
type.parsers.add(new MapParser())
type.parsers.add(new SetParser())
type.parsers.add(new BooleanParser())
type.parsers.add(new IntegerParser())
type.parsers.add(new BinParser())
type.parsers.add(new OctParser())
type.parsers.add(new HexParser())
type.parsers.add(new Base32Parser())
type.parsers.add(new Base36Parser())
type.parsers.add(new Base64Parser())
type.parsers.add(new DataUrlParser ())
type.parsers.add(new BlobParser())
type.parsers.add(new FloatParser())
type.parsers.add(new NumberParser())
type.parsers.add(new BigIntParser())
type.parsers.add(new StringParser())
type.parsers.add(new SymbolParser())
type.parsers.add(new FunctionParser())
type.parsers.add(new ClassParser())
type.parsers.add(new InstanceParser())
type.parsers.add(new DateTimeParser())
type.parsers.add(new DateParser())
type.parsers.add(new TimeParser())
type.parsers.add(new DurationParser())
type.parsers.add(new ColorParser())
type.parsers.add(new DecimalParser())
for (let p of type.parsers.parsers) {
    const names = ((Array.isArray(p.names)) ? p.names : ((isStr(p.names)) ? [p.names] : null))
    //console.log(names, isStrs(names))
    if (!isStrs(names)) { continue }
    //console.log(type, type.prototype, )
    //for (let n of names) { console.log(n, `is${n.Pascal}`);type[`is${n.Pascal}`] = function(v, p1) { return p.is(v, p1) } }
    //for (let n of names) { console.log(n, `is${n}`);type[`is${n}`] = function(v) { return p.is(v) } }
    //for (let n of names) { const name = (('bigint'===n) ? 'BigInt' : n.Pascal); console.log(n, `is${name}`);type[`is${name}`] = function(v) { return p.is(v) } }
    /*
    for (let n of names) {
        type[`is${n.Pascal}`] = function(v) { return p.is(v) }
        if ('bigint'===n) { type[`isBigInt`] = function(v) { return p.is(v) } }
    }
    */
    for (let n of names) {
        //console.log(n, `is${n.Pascal}`)
        type[`is${n.Pascal}`] = function(v, p1) { return p.is(v, p1) }
    }
    /*
    type[`parse`] = function(to, v) {
        const parser = this.parsers.get(to)
        //const parser = ((to) ? this.parsers.get(to) : this.parsers.getFromValue(v))
//        const parser = ((from) ? this.parsers.get(from) : this.parsers.getFromValue(v))
//        if (!parser) { throw new Error(`parse()の第二引数で第一引数の型名を指定してください。（値の型が${'undefined,null,bool,int,float,bigint,num,dt,sym,fn,str,obj,ary'.split(',')}のいずれかであれば型名を省略できます）`) }
        return parser.parse(v)
    }
    type[`stringify`] = function(v, from) {
        const parser = ((from) ? this.parsers.get(from) : this.parsers.getFromValue(v))
        if (!parser) { throw new Error(`stringify()の第二引数で第一引数の型名を指定してください。（値の型が${'undefined,null,bool,int,float,bigint,num,dt,sym,fn,str,obj,ary'.split(',')}のいずれかであれば型名を省略できます）`) }
        return parser.stringify(v)
    }
    type[`to`] = function(to, v, from) {
        const parser = ((to) ? this.parsers.get(to) : this.parsers.getFromValue(v))
        
    }
    */
}
window.Type = type
/*
class TypeParser {
    constructor(names) { this._names = names }
    get names() { return this._names }
    match(type) {
             if (isStr (type) && isStr (this._names)) { return this._names===type }
        else if (isStr (type) && isStrs(this._names)) { return this._names.some(t=>t===type) }
        else if (isStrs(type) && isStr (this._names)) { return type.some(t=>t===this._names) }
        else if (isStrs(type) && isStrs(this._names)) {
            for (let typ of type) {
                for (let t of this._names) {
                    if (t===typ) { return true }
                }
            }
            return false
        }
        throw new Error(`引数typeは文字列または文字列の配列であるべきです。:${typeof type}: ${type}`)
    }
    parse(str) { throw new Error(`未実装`) }
    stringify(val) { return val.toString() }
}
class UndefinedParser extends TypeParser {
    constructor(names='undefined') { super(names) }
    parse(str) { return undefined }
    stringify(val) { return 'undefined' }
}

window.Type = type
//    #call(name, v) {
//        if (this.hasOwnProperty(name)) { return this[name](v) }
//        this[this._names]
//    }
    isString(v) { return typeof v === "string" || v instanceof String }
    isBoolean(v) { return 'boolean' === typeof v }
    //isNumber(v) { return 'number' === typeof v && !isNaN(v) }
    //isNumber(v) { return Number.isFinite(v) } // new Number(1) が false になってしまう
    isNumber(v) { return ('number'===typeof v && !isNaN(v)) || (this.#isObjectLike(v) && this.#getTag(v)=='[object Number]') } // https://github.com/lodash/lodash/blob/master/isNumber.js
    isInteger(v)   { return this.isNumber(v) && v % 1 === 0 }
    isPositiveInteger(v)   { return this.isInteger(v) && 0<=v }
    isNegativeInteger(v)   { return this.isInteger(v) && v<0 }
    isFloat(v) { return this.isNumber(v) && (v % 1 !== 0 || 0===v) }
    isDate(v) { return v && v.getMonth && typeof v.getMonth === 'function' && Object.prototype.toString.call(v) === '[object Date]' && !isNaN(v) } // https://stackoverflow.com/questions/643782/how-to-check-whether-an-object-is-a-date
    isBigInt(v) { return 'bigint' === typeof v }
    isSymbol(v) { return 'symbol' === typeof v }
    isElement(v) {
        try { return v instanceof HTMLElement; }
        catch(e){
            return (typeof v==="object") &&
                (v.nodeType===1) && (typeof v.style === "object") &&
                (typeof v.ownerDocument ==="object");
        }
    }
    isArray(v) { return Array.isArray(v) }
    isObject(v) { // https://github.com/lodash/lodash/blob/master/isPlainObject.js
        if (!this.#isObjectLike(v) || this.#getTag(v) != '[object Object]') { return false }
        if (Object.getPrototypeOf(v) === null) { return true }
        let proto = v
        while (Object.getPrototypeOf(proto) !== null) { proto = Object.getPrototypeOf(proto) }
        return Object.getPrototypeOf(v) === proto
    }
    #isObjectLike(v) { return typeof v === 'object' && v !== null }
    #getTag(v) { return (v == null) ? (v === undefined ? '[object Undefined]' : '[object Null]') : toString.call(v) }
    isFunction(v) { return typeof v === 'function' }
    isInstance(ins, cls) { return ins instanceof cls }

    isStr(v) { return this.isString(v) }
    isBool(v) { return this.isBoolean(v) }
    isNum(v) { return this.isNumber(v) }
    isInt(v) { return this.isInteger(v) }
    isPosInt(v) { return this.isPositiveInteger(v) }
    isNegInt(v) { return this.isNegativeInteger(v) }
    isEl(v) { return this.isElement(v) }
    isAry(v) { return this.isArray(v) }
    isObj(v) { return this.isObject(v) }
    isFn(v) { return this.isFunction(v) }
    isIns(ins, cls) { return ins instanceof cls }

    isS(v) { return this.isString(v) }
    isB(v) { return this.isBoolean(v) }
    isN(v) { return this.isNumber(v) }
    isI(v) { return this.isInteger(v) }
    isF(v) { return this.isFloat(v) }
    isD(v) { return this.isDate(v) }
    isE(v) { return this.isElement(v) }
    isA(v) { return this.isArray(v) }
    isO(v) { return this.isObject(v) }

    // array<T>
    isStrings(v) { return Array.isArray(v) && v.every(x=>this.isString(x)) }
    isNumbers(v) { return Array.isArray(v) && v.every(x=>this.isNumber(x)) }
    isIntegers(v) { return Array.isArray(v) && v.every(x=>this.isInteger(x)) }
    isPositiveIntegers(v) { return Array.isArray(v) && v.every(x=>this.isPositiveInteger(x)) }
    isNegativeIntegers(v) { return Array.isArray(v) && v.every(x=>this.isNegativeInteger(x)) }
    isFloats(v) { return Array.isArray(v) && v.every(x=>this.isFloat(x)) }
    isBooleans(v) { return Array.isArray(v) && v.every(x=>this.isBoolean(x)) }
    isDates(v) { return Array.isArray(v) && v.every(x=>this.isDate(x)) }
    isBigInts(v) { return Array.isArray(v) && v.every(x=>this.isBigInt(x)) }
    isSymbols(v) { return Array.isArray(v) && v.every(x=>this.isSymbol(x)) }
    isElements(v) { return Array.isArray(v) && v.every(x=>this.isElement(x)) }
    isArrays(v) { return Array.isArray(v) && v.every(x=>this.isArray(x)) }
    isObjects(v) { return Array.isArray(v) && v.every(x=>this.isObject(x)) }
    isFunctions(v) { return Array.isArray(v) && v.every(x=>this.isFunction(x)) }
    // array<T> short
    isStrs(v) { return Array.isArray(v) && v.every(x=>this.isString(x)) }
    isNums(v) { return Array.isArray(v) && v.every(x=>this.isNumber(x)) }
    isInts(v) { return Array.isArray(v) && v.every(x=>this.isInteger(x)) }
    isBools(v) { return Array.isArray(v) && v.every(x=>this.isBoolean(x)) }
    isEls(v) { return Array.isArray(v) && v.every(x=>Type.Element(x)) }
    isArys(v) { return Array.isArray(v) && v.every(x=>this.isArray(x)) }
    isObjs(v) { return Array.isArray(v) && v.every(x=>this.isObject(x)) }
    isFns(v) { return Array.isArray(v) && v.every(x=>this.isFunction(x)) }
    // array<T> short
    isSs(v) { return Array.isArray(v) && v.every(x=>this.isString(x)) }
    isNs(v) { return Array.isArray(v) && v.every(x=>this.isNumber(x)) }
    isIs(v) { return Array.isArray(v) && v.every(x=>this.isInteger(x)) }
    isFs(v) { return Array.isArray(v) && v.every(x=>this.isFloat(x)) }
    isDs(v) { return Array.isArray(v) && v.every(x=>this.isDate(x)) }
    isBs(v) { return Array.isArray(v) && v.every(x=>this.isBoolean(x)) }
    isEs(v) { return Array.isArray(v) && v.every(x=>Type.Element(x)) }
    isAs(v) { return Array.isArray(v) && v.every(x=>this.isArray(x)) }
    isOs(v) { return Array.isArray(v) && v.every(x=>this.isObject(x)) }

    to(type, value) { // boxing  value:型変換したい値, type:型名(typeof)
        switch(type.toLowerCase()) {
            case 'undefined': return undefined
            case 'null': return null
            case 'object': return {}
            case 'array': return []
            case 'boolean': return ((value) ? (['true','1'].some(v=>v===value.toString().toLowerCase())) : false)
            case 'number': return Number(value)
            case 'integer': return parseInt(value)
            case 'float': return parseFloat(value)
            case 'string': return String(value)
            case 'bigint': return BigInt(value)
            case 'symbol': return Symbol(value)
            case 'function': return new Function(value)
            case 'class': return Function(`return (${value})`)() // value: Class名（new ClassName()） 未定義エラーになる…
            default: throw new Error('typeは次のいずれかのみ有効です:undefined,null,object,array,boolean,number,integer,float,string,bigint,symbol,function,class')
//            default: return Function('return (' + classname + ')')()
        }
    }

}
window.Type = new Type()
String.prototype.capitalize = function(str) { return this.charAt(0).toUpperCase() + this.slice(1).toLowerCase() }
*/
})()
