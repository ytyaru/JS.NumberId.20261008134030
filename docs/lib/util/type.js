(function() {
class Type {
    get nil() {return this._nil}
    get NOT_EXIST() {return this._NOT_EXIST}
    get NOT_EXIST_FIELD() {return this._NOT_EXIST_FIELD}
    constructor() {
        this._nil = Symbol('nil')
        this._NOT_EXIST = Symbol('not-exist')
        this._NOT_EXIST_FIELD = Symbol('not-exist-field')
//        Object.defineProperty(this.constructor, 'NOT_EXIST_FIELD', {get(){return Symbol('not-exist-field')}})
        this._types = {
            AsyncFunction: (async()=>{}).constructor,
            GeneratorFunction: (function*(){yield undefined;}).constructor,
            AsyncGeneratorFunction: (async function*(){yield undefined;}).constructor,
        }
        this._typeName = new TypeName(this)
        this._names = new Map([
            ['Null', [[], (v)=>null===v]],
            ['Undefined', [['Und'], (v)=>undefined===v]],
            ['Defined', [['Def','Any'], (v)=>undefined!==v && !Number.isNaN(v)]],
            ['NullOrUndefined', [['NU'], (v)=>null===v || undefined===v]],
            ['NullOrUndefinedNaN', [['NUN'], (v)=>null===v || undefined===v || Number.isNaN(v)]],
            ['Boolean', [['Bool', 'Bln', 'B'], (v)=>'boolean'===typeof v]],
            ['NaN', [[], (v)=>Number.isNaN(v)]],

            // 数の型＝有限数Finitie(整数Integer, 少数(浮動Float/十進数Decimal), 分数Fraction, 比率Rate, 比Ratio)/無限数Infinitie
            // https://github.com/lodash/lodash/blob/master/isNumber.js
            ['Number', [['Num', 'N'], (v)=>('number'===typeof v && !isNaN(v)) || (this.#isObjectLike(v) && this.#getTag(v)=='[object Number]')]],
            ['Integer', [['Int', 'I'], (v)=>this.isNumber(v) && 0===v%1]],
            ['PositiveInteger', [['PInt','PosInt'], (v)=>this.isInteger(v) && 0<=v]],
            ['NegativeInteger', [['NInt','NegInt'], (v)=>this.isInteger(v) && v<0]],
            ['BigInt', [['Big'], (v)=>'bigint'===typeof v]],
            ['Float', [['Flt','F'], (v)=>this.isNumber(v) && (v % 1 !== 0 || 0===v)]],
            ['String', [['Str', 'S'], (v)=>'string'===typeof v || v instanceof String]],
            ['Symbol', [['Sym'], (v)=>'symbol'===typeof v]],
            ['Primitive', [['Prim'], (v)=>v !== Object(v)]],
            // null,undefined,nanを抜いたprimitive
            ['ValidPrimitive', [['VPrim','VP','Val','Value'], (v)=>this.isNUN(v) ? false : this.isPrim(v)]],
            ['Reference',[['Ref'],(v)=>!this.isNUN(v) && v === Object(v)]],

            ['Class', [['Cls'], (v)=>(('function'===typeof v) && (!!v.toString().match(/^class /)))]],
            ['Instance', [['Ins'], (v, c)=>{
                if (this.isPrimitive(v)) return false
                if (this.isFunction(v)) return false
                if (this.isCls(v)) return false // Class
                if (this.isErrCls(v)) return false // Error Class
                if (this.isObj(v)) return false   // Object
                if (this.isAry(v)) return false   // Array
                try {return ((undefined===c) ? true : (v instanceof c));}// cがあるときはそのクラスのインスタンスであるか確認する
                catch(err) {console.warn(err);return false}//TypeError: Right-hand side of 'instanceof' is not callable
            }]],
            ['ErrorClass', [['ErrCls'], (v)=>Error===v||Error.isPrototypeOf(v)]], // Error.isPrototypeOf(TypeError)
            ['ErrorInstance', [['ErrIns','Error','Err'], (v)=>v instanceof Error]], // new TypeError() instanceof Error
            ['Function', [['Func', 'Fn'], (v)=>'function'===typeof v && !v.toString().match(/^class /) && !this.isErrCls(v)]],
            ['SyncFunction', [['SyncFn', 'SFn'], (v)=>this.isFn(v) && !this.isAFn(v) && !this.isGFn(v) && !this.isAGFn(v)]],
            ['AsyncFunction', [['AsyncFunc', 'AsyncFn', 'AFn'], (v)=>v instanceof this._types.AsyncFunction]],
            ['GeneratorFunction', [['GenFn', 'GFn'], (v)=>v instanceof this._types.GeneratorFunction || v instanceof this._types.AsyncGeneratorFunction]],
            ['SyncGeneratorFunction', [['SyncGenFn', 'SGFn'], (v)=>v instanceof this._types.GeneratorFunction && !(v instanceof this._types.AsyncGeneratorFunction)]],
            ['AsyncGeneratorFunction', [['AsyncGenFn', 'AGFn'], (v)=>v instanceof this._types.AsyncGeneratorFunction]],
            ['Promise', [[], (v)=>v instanceof Promise]],
            ['Iterator', [['Iter', 'Itr', 'It'], (v)=>{
                if (this.isNullOrUndefined(v)) { return false }
                return 'function'===typeof v[Symbol.iterator]
            }]],
            ['Empty', [[], (v, noErr)=>{
                if (this.isItr(v)) {
                    if ('length,size'.split(',').some(n=>v[n]===0)) { return true }
                    return false
                } else { if(noErr) {return false} else { throw new TypeError(`Not iterator.`) } }
            }]],
            ['Blank', [[], (v)=>this.isObj(v) ? 0===Object.keys(v).length : (()=>{throw new TypeError('Not Type.isObj(v).')})()]],
            ['NullOrUndefinedOrEmpty', [['NUE'], (v)=>this.isNU(v) || this.isEmpty(v, true)]],
            ['Array', [['Ary', 'A'], (v)=>Array.isArray(v)]],
            ['Map', [[], (v)=>v instanceof Map]],
            ['Set', [[], (v)=>v instanceof Set]],
            ['WeakMap', [[], (v)=>v instanceof WeakMap]],
            ['WeakSet', [[], (v)=>v instanceof WeakSet]],
            ['Object', [['Obj', 'O'], (v)=>{
                if (this.isPrimitive(v)){return false}
                // instance と区別するには constructor が Class かどうかで判断する
                const P = Object.getPrototypeOf(v)
                return null!==v && 'object'===typeof v && '[object Object]'===this.#getTag(v) && !(P && P.hasOwnProperty('constructor') && this.isCls(P.constructor));
            }]],
            // https://stackoverflow.com/questions/643782/how-to-check-whether-an-object-is-a-date
            ['Date', [['Dt','D'], (v)=>this.isPrimitive(v) ? false : Boolean(v && v.getMonth && typeof v.getMonth === 'function' && this.#toString(v) === '[object Date]' && !isNaN(v))]],
            ['RegExp', [[], (v)=>v instanceof RegExp]],
            ['URL', [[], (v)=>v instanceof URL]],
            ['Element', [['Elm', 'El', 'E'], (v)=>{
                try { return v instanceof HTMLElement; }
                catch(e){
                    return (typeof v==='object') &&
                        (v.nodeType===1) && (typeof v.style === 'object') &&
                        (typeof v.ownerDocument==='object');
                }
            }]],
        ])
        for (let [k,v] of this._names.entries()) {
            const fnName = `is${k}`
            const [abbrs, fn] = v
            if ('function'!==typeof fn) { throw new Error(`${fnName}が未定義です。`)}
            this.#defineMain(fnName, fn) // 正式
            for (let name of abbrs) { this.#defineAbbr(`is${name}`, fn) } // 略名
            // 複数形
            const fns = (args)=>Array.isArray(args) && args.every(x=>fn(x))
            this.#defineMain(`${fnName}s`, fns) // 複数形
            for (let name of abbrs) { this.#defineAbbr(`is${name}s`, fns) } // 略名
        }
    }
    #isObjectLike(v) { return typeof v === 'object' && v !== null }
    #toString(v){return Object.prototype.toString.call(v)} // [object Object] のような文字列を返す。Object.create(null)でも。
    #getTag(v) { return (v == null) ? (v === undefined ? '[object Undefined]' : '[object Null]') : this.#toString(v) }
    #defineMain(name, getter) {
        Object.defineProperty(this, name, {
            value: (...args)=>getter(...args),
            writable: false,
            enumerable: true,
            configurable: false,
        })
    }
    #defineAbbr(name, getter) {
        Object.defineProperty(this, name, {
            value: (...args)=>getter(...args),
            writable: false,
            enumerable: true,
            configurable: false,
        })
    }
    // 使いそうだけど型というには微妙なAPIたち↓
    isNUSome(...vs) { return vs.some(v=>this.isNU(v)) }
    isNUEvery(...vs) { return vs.every(v=>this.isNU(v)) }
    isRange(v, min, max) { return min <= v && v <= max }

    // 実行可能なら引数なしで実行する。不能ならそのまま返す
    fnV(v) {
        if (this.isGFn(v) || this.isAFn(v)) { throw new TypeError(`ジェネレータ関数や非同期関数は受け付けません。`) }
        return this.isFn(v) ? v() : v
    }
    /*
    valid(name) { // 型名nameがType既定の文字列／定義済みグローバル型名と一致するか
        const N = name.toLowerCase()
        for (let [k,v] of Type._names) {
            const [abbr, fn] = v
            if (N===k.toLowerCase()) {return true}
            if (abbr.some(a=>a.toLowerCase()===N)) {return true}
        }
        if (name in window && Type.isCls(window[name])) {return true}
        return false
    }
    */
    get name() { return this._typeName }
    getName(v) {
        if (undefined===v) { return 'Undefined' }
        if (null===v) { return 'Null' }
        if (this.isBool(v)) { return 'Boolean' }
        if (this.isInt(v)) { return 'Integer' }
        if (this.isFloat(v)) { return 'Float' }
        if (this.isBigInt(v)) { return 'BigInt' }
        if (this.isSym(v)) { return 'Symbol' }
        if (this.isErrCls(v)) { return `(ErrorClass ${v.name})` }
        if (this.isErrIns(v)) { return `(ErrorInstance ${v.constructor.name})` }
        if (this.isCls(v)) { return v.name ? `(Class ${v.name})` : `(NoNameClass)` }
        if (this.isIns(v)) { return v.constructor.name ? `(Instance ${v.constructor.name})` : `(NoNameClassInstance)` }
        if (this.isAFn(v) || this.isGFn(v) || this.isAGFn(v)) { return v.constructor.name }
        if (this.isObj(v)) { return 'Object' }
        try { if (Type.isStr(v.typeName)) { return v.typeName } } catch (e) {} // Proxy
        // 上記のいずれかに当てはまることを期待している
        const name = typeof v
        return name[0].toUpperCase() + name.slice(1)
    }
    toStr(x) {
        if (!this.isObj(x) && !this.isAry(x)) { x = {x:x} }
        return JSON.stringify(x, (k,v)=>ifel(
        (this.isBool(v) || this.isInt(v) || this.isFloat(v)), v,
        this.isErrCls(v), ()=>v.constructor.name,
        this.isErrIns(v), ()=>`${v.name}(${v.message})`,
        this.isIns(v, Array), ()=>'['+v.map(V=>this.toStr(V)).join(',')+']',
        this.isIns(v, Map), ()=>[...v.entries()].map(([K,V])=>`k:`+this.toStr(V)).join(','),
        this.isIns(v, Set), ()=>[...v.values()].map(V=>this.toStr(V)),
        this.isFn(v), ()=>v.toString(),
        this.isCls(v), ()=>v.toString(),
        v))
    }
    eq(a, b) { return this.toStr(a)===this.toStr(b) }
    to(type, ...values) { // boxing  value:型変換したい値, type:型名(typeof)
        switch(type.toLowerCase()) {
            case 'undefined': return undefined
            case 'null': return null
            case 'object': return {}
            case 'array': return []
            case 'boolean': return ((values[0]) ? (['true','1'].some(v=>v===values[0].toString().toLowerCase())) : false)
            case 'number': return Number(values[0])
            case 'integer': return parseInt(values[0])
            case 'float': return parseFloat(values[0])
            case 'string': return String(values[0])
            case 'bigint': return BigInt(values[0])
            case 'symbol': return Symbol(values[0])
            case 'function': return new Function(values[0])
            case 'class': return Function(`return class ${values[0]} {};`)() // values[0]: Class名（new ClassName()） 未定義エラーになる…
            case 'instance': {
                if (0===values.length) { throw new Error(`コンストラクタが必要です。`) }
                const c = values[0]
                const args = values.slice(1)
                return Reflect.construct(c, args);
            } // Class, [auguments]
            default: throw new Error('typeは次のいずれかのみ有効です:undefined,null,object,array,boolean,number,integer,float,string,bigint,symbol,function,class')
        }
    }
    // メタ(has/get)
//    has(obj,key) { return this.isCls(obj) || this.isIns(obj) ? this.hasMember(obj,key) : this.hasProperty(obj,key) }
    has(obj,key) { return this[`has${this.isCls(obj) || this.isIns(obj) ? 'Member' : 'Property'}`](obj,key) }
    get(obj,key) { return this[`get${this.isCls(obj) || this.isIns(obj) ? 'Member' : 'Property'}`](obj,key) }
    hasProperty(obj,key) {
        if (!obj || !key) {return false}
        else if (this.hasOwnProperty(obj,key)) { return true }
        else { return this.hasProperty(Object.getPrototypeOf(obj),key) }
    }
    hasMember(obj,key) {
        if (this.isIns(obj)) {
            for (let k of ['Field','Method','Getter','Setter']) {
                if (this[`has${k}`](obj,key)) {return true}
            }
        }
        else if (this.isCls(obj)) {
            if (this.hasField(obj,key)){return true} // class var
            else if(this.hasFn(obj,key)){return true} // static method
        }
//        else { return this.hasProperty(obj,key) }
    }
    hasFn(obj,key) { return this.isFn(this._getDesc(obj,key).value) && !this.hasGS(obj,key) }
    hasMethod(obj,key) {
        if (!obj || !key) {return false}
        if (this.hasOwnMethod(obj,key)) { return true }
        else {return this.hasMethod(Object.getPrototypeOf(obj),key)}
    }
    hasStaticMethod(obj,key) { return !!this.getStaticMethod(obj,key) }
    hasGetter(obj,key) { return this.isFn(obj.__lookupGetter__(key)) || this._hasG(obj,key) }
    hasSetter(obj,key) { return this.isFn(obj.__lookupSetter__(key)) || this._hasS(obj,key) }
    hasGS(obj,key) { return this.hasGetter(obj,key) || this.hasSetter(obj,key) }
    hasField(obj,key) {
        if (!obj || !key) {return false}
        else if (this.hasOwnField(obj,key)) { return true }
        else { return this.hasField(Object.getPrototypeOf(obj),key) }
    }
    _hasG(obj,key) { return this._hasGS(obj,key) }
    _hasS(obj,key) { return this._hasGS(obj,key,true) }
    _hasGS(obj,key,isS) { try { return this.isFn(this._getDesc(obj,key)[(isS ? 's' : 'g')+'et']) } catch(e) {return false} }
    _getDesc(obj, key) { return obj
        ? Object.getOwnPropertyDescriptor(obj, key) ?? this._getDesc(Object.getPrototypeOf(obj), key)
        : undefined
    }
    getProperty(obj,key) {
        if (!obj || !key) {return undefined}
        else if (this.hasOwnProperty(obj,key)) { return obj[key] }
        else { return this.getProperty(Object.getPrototypeOf(obj),key) }
    }
    getMember(obj,key) {
        if (this.isIns(obj)) {
            for (let k of ['Field','Method','Getter','Setter']) {
                const item = this[`get${k}`](obj,key)
//                console.log(k, item, obj, key)
                if (undefined!==item && this.NOT_EXIST_FIELD!==item) {return item}
            }
        }
        else if (this.isCls(obj)) {
            for (let k of ['Field','Fn','Getter','Setter']) {
                const item = this[`get${k}`](obj,key)
                //if (item) {return item}
//                console.log(k, item, obj, key, )
                if (undefined!==item && this.NOT_EXIST_FIELD!==item) {return item}
            }
        }
    }
    getFn(obj,key) {
        const m = this._getDesc(obj,key).value
        if (!this.isFn(m) || this.hasGS(obj,key)) { return undefined }
        else { return m }
    }
    getMethod(obj,key) {
        if (this.hasProperty(obj,key)) {
//            console.log(obj, key, this.isIns(obj), this.isFn(obj[key]))
            if (this.isIns(obj) && this.isFn(obj[key])) { return obj[key] }
        }
    }
    getStaticMethod(obj,key) {
        const m = this.getOwnStaticMethod(obj,key)
        if (m) { return m }
        else if (this.isCls(obj)) { return this.getStaticMethod(Object.getPrototypeOf(obj),key) }
        else if (this.isIns(obj)) { return this.getStaticMethod(Object.getPrototypeOf(Object.getPrototypeOf(obj).constructor),key) }
        else { return undefined }
    }
    getGetter(obj,key) {
        const g = this.getOwnGetter(obj,key)
        if (g) { return g }
        else if (obj) { return this.getGetter(Object.getPrototypeOf(obj),key) }
    }
    getSetter(obj,key) {
        const s = this.getOwnSetter(obj,key)
        if (s) { return s }
        else if (obj) { return this.getSetter(Object.getPrototypeOf(obj),key) }
    }
    getField(obj,key) {
        if (!obj){return this.NOT_EXIST_FIELD}
        const f = this.getOwnField(obj,key)
//        console.log(f)
        if (this.NOT_EXIST_FIELD!==f) {return f}
//        if (undefined!==f) { return f }
        const P = Object.getPrototypeOf(obj)
//        console.log(P)
        if (P) { return this.getField(P,key) }
        return this.NOT_EXIST_FIELD
//        const f = this._getDesc(obj,key).value ?? obj[key]
//        if (this.isFn(f) || this.hasGS(obj,key)) { return undefined }
//        else { return f }
    }
    getOwner(name, target) {
        if (this.isNU(target)) { return null }
        else if ('function'===typeof target[name]) { return target }
        else if (target.hasOwnProperty(name)) { return target }
        else { this.getOwner(name, Object.getPrototypeOf(target)) }
    }

    hasOwn(obj,key){const r=this.getOwn(obj,key); return undefined!==r || this.NOT_EXIST_FIELD!==r; }
    hasOwnMember(obj,key){const r=this.getOwnMember(obj,key); return undefined!==r || this.NOT_EXIST_FIELD!==r; }
    #getOwnPropertyNames(obj) { return Object.prototype.getOwnPropertyNames.call(obj) }
    hasOwnProperty(obj,key) { return this.#getOwnPropertyNames(obj).includes(key) }
    hasOwnMember(ins,key) {
        if (this.isIns(obj)) {
            for (let k of ['Field','Method','Getter','Setter']) {
                const item = this[`getOwn${k}`](obj,key)
//                console.log(k, item, obj, key)
                if (item) {return item}
            }
        }
        else if (this.isCls(obj)) {
            for (let k of ['Field','Fn','Getter','Setter']) {
                const item = this[`getOwn${k}`](obj,key)
                if (item) {return item}
            }
        }
    }
    hasOwnFn(obj,key) { return this.isFn(this._getDesc(obj,key).value) }
    hasOwnMethod(obj,key) {
        if (!this.isIns(obj)) { return false }
        if (!this._getDesc(obj,key)) { return false }
        return this.isFn(this._getDesc(obj,key).value)
    }
    hasOwnStaticMethod(obj,key) { return !!this.getOwnStaticMethod(obj,key) }
    hasOwnGetter(obj,key) { return this.isFn(obj.__lookupGetter__(key)) || this._hasOwnG(obj,key) }
    hasOwnSetter(obj,key) { return this.isFn(obj.__lookupSetter__(key)) || this._hasOwnS(obj,key) }
    hasOwnGSo(obj,key) { return this.hasOwnGetter(obj,key) || this.hasOwnSetter(obj,key) }
    hasOwnGSa(obj,key) { return this.hasOwnGetter(obj,key) && this.hasOwnSetter(obj,key) }
    hasOwnField(obj,key) {
        const p=obj.hasOwnProperty(key)
        return p && !this.isFn(obj[key]) && !this.hasOwnGSo(obj,key)
    }
    _hasOwnG(obj,key) { return this._hasOwnGS(obj,key) }
    _hasOwnS(obj,key) { return this._hasOwnGS(obj,key,true) }
    _hasOwnGS(obj,key,isS) { try { return this.isFn(this._getOwnDesc(obj,key)[(isS ? 's' : 'g')+'et']) } catch(e) {return false} }
    _getOwnDesc(obj,key) { return Object.getOwnPropertyDescriptor(obj, key) }

    getOwn(obj,key) { return this[`getOwn${this.isCls(obj) || this.isIns(obj) ? 'Member' : 'Property'}`](obj,key) }
    getOwnMember(obj,key) {
        if (this.isIns(obj)) {
            let isNEF = false;
            for (let k of ['Field','Method','Getter','Setter']) {
                const item = this[`getOwn${k}`](obj,key)
//                console.log(k, item, obj, key)
                if ('Field'===k && this.NOT_EXIST_FIELD===item) {isNEF=true}
                if (undefined!==item && this.NOT_EXIST_FIELD!==item) {return item}
            }
            if (isNEF) {return this.NOT_EXIST_FIELD}
        }
        else if (this.isCls(obj)) {
            let isNEF = false;
            for (let k of ['Field','Fn','Getter','Setter']) {
                const item = this[`getOwn${k}`](obj,key)
                //if (item) {return item}
//                console.log(k, item, obj, key, )
                if ('Field'===k && this.NOT_EXIST_FIELD===item) {isNEF=true}
                if (undefined!==item && this.NOT_EXIST_FIELD!==item) {return item}
            }
            if (isNEF) {return this.NOT_EXIST_FIELD}
        }
    }
    getOwnProperty(obj,key){ if (this.hasOwnProperty(obj,key)) {return obj[key]} }
    getOwnFn(obj,key){ if (this.hasOwnProperty(obj,key) && this.isFn(obj[key]) && !this.hasOwnGSo(obj,key)) {return obj[key]} }
    getOwnMethod(obj,key) { if (this.isIns(obj) && this.hasOwnProperty(obj,key) && this.isFn(obj[key]) && !this.hasOwnGSo(obj,key)) {return obj[key]} }
    getOwnStaticMethod(obj,key) {
        if (this.isCls(obj) && this.getOwnFn(obj,key)) {return obj[key]}
        else if (this.isIns(obj) && this.getOwnFn(obj.constructor,key)) {return obj.constructor[key]}
    }
    getOwnGetter(obj,key) { if (obj && key) {
        const d=this._getDesc(obj,key)
        return d && d.hasOwnProperty('get') ? d.get : obj.__lookupGetter__(key)
    }}
    getOwnSetter(obj,key) { if (obj && key) {
        const d=this._getDesc(obj,key)
        return d && d.hasOwnProperty('set') ? d.set : obj.__lookupSetter__(key)
    }}
    //getOwnField(obj,key) {if(this.hasOwnProperty(obj,key) && !this.isFn(obj[key]) && !this.hasOwnGSo(obj,key)){return obj[key]}}
    getOwnField(obj,key) {
//        console.log(this.hasOwnProperty(obj,key), !this.isFn(obj[key]), !this.hasOwnGSo(obj,key), obj[key])
        if(this.hasOwnProperty(obj,key) && !this.isFn(obj[key]) && !this.hasOwnGSo(obj,key)){return obj[key]}
//        console.log('NOT_EXIST_FIELD:',this.NOT_EXIST_FIELD)
        return this.NOT_EXIST_FIELD
    }
}
//Object.defineProperty(Type.prototype, 'NOT_EXIST_FIELD', {get(){return Symbol('not-exist-field')}})
class TypeName {
    constructor(type){this.T=type}
    get(name) {
        const N = name.toLowerCase()
        console.log(this.T._names)
        for (let [k,v] of this.T._names) {
            const [abbr, fn] = v
            if (N===k.toLowerCase()) {return k}
            if (abbr.some(a=>a.toLowerCase()===N)) {return k}
        }
        if (name in window && this.T.isCls(window[name])) {return name}
    }
    valid(name) { return !!this.get(name) } // 型名nameがType既定の文字列／定義済みグローバル型名と一致するか
    is(name, ...args) {
        const N = this.get(name)
        if (!N) {throw new TypeError(`'${name}'は不正な型名です。`)}
        return this.T[`is${N}`](...args)
    }
}
window.Type = new Type()
String.prototype.capitalize = function() { return this.charAt(0).toUpperCase() + this.slice(1).toLowerCase() }
})()
// 糖衣構文 if else-if else (...) {return} を再現する
function ifel(...args) {
    if (args.length<2) { throw TypeError(`引数は2つ以上必要です。[condFn1, retFn1, condFn2, retFn2, ..., defFn]`) }
    const setNum = Math.floor(args.length/2);
    for (let i=0; i<setNum*2; i+=2) {
        const cond = !!Type.fnV(args[i])
        if (cond) { return Type.fnV(args[i+1]) }
    }
    if (setNum*2<args.length) { return Type.fnV(args[setNum*2]) }
}
// Auguments.of(auguments).match(
//     `int`, (...args)=>someInt(...args),
//     `int,str`, (...args)=>someIntStr(...args),
// )
class Auguments {
    static of(args) { return new Auguments(args) }
    constructor(args) { this._args = args }
    match(...condFns) {
        if (condFns.length<2) { throw TypeError(`引数は2つ以上必要です。[cond1, retFn1, cond2, retFn2, ..., defFn]`) }
        const setNum = Math.floor(condFns.length/2);
        for (let i=0; i<setNum*2; i+=2) {
            const metNms = this._getMethodNames(condFns[i], i)
            if (this._matchTypes(metNms)) { return condFns[i+1](...this._args) }
            else { continue }
        }
        if (setNum*2<condFns.length) { return condFns[setNum*2](...this._args) }
        throw new TypeError(`どの引数パターンとも一致しませんでした。`)
    }
    _getMethodNames(condStr, i) {
        if (!Type.isStr(condStr)) { throw new TypeError(`引数condFns[${i}]はTypeにあるis系メソッド名の型名(文字列型)であるべきです。不正値(型名): ${this.getName(condStr)}`) }
        const metNms = []
        for (let name of condStr.split(',')) {
            const metNm = `is${name.trim().capitalize()}`
            if (!(metNm in Type)) { throw new TypeError(`引数condFns[${i}]はTypeにあるis系メソッド名の型名であるべきです。不正値: ${name}`) }
            metNms.push(metNm)
        }
        return metNms
    }
    _matchTypes(metNms) {
        if (this._args.length!==metNms.length) { return false }
        for(let i=0; i<metNms.length; i++) {
            if (!Type[metNms[i]](this._args[i])) { return false }
        }
        return true
    }
}
