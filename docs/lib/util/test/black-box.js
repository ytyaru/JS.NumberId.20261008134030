(function(){
Type;Assertion; // 依存ライブラリ（未存在なら例外発生）ReferenceError: Type is not defined
// const a = new Assertion()
// const bb = new BlackBox(a)
// bb.test(...)
//   関数
//     単発
//       fn, (r)=>r===1
//       fn, TypeError
//       fn, TypeError, 'msg'
//       fn, new TypeError('msg')
//       fn, [arg1, ...], (r)=>r===1
//       fn, [arg1, ...], TypeError
//       fn, [arg1, ...], TypeError, 'msg'
//       fn, [arg1, ...], new TypeError('msg')
//     複数
//       fn, [
//             [[arg1, ...], (r)=>r===1], 
//             [[arg1, ...], TypeError],
//             [[arg1, ...], TypeError, 'msg'],
//             [[arg1, ...], new TypeError('msg')],
//       ]
//   クラス
//     単発（constructor, getter, setter, method(static, instance)）
//       コンストラクタ
//         cls, (t)=>t.p===1
//         cls, TypeError
//         cls, TypeError, 'msg'
//         cls, new TypeError('msg')
//     複数
/*
[target, (m/g/s/d), (f), asserts]
{
  target /tar/t: Human/new Human('山田'), // 必須
  method /met/m: 'someMethod',            // 任意（m,g,s,dは一つもないか一つだけのみ許容する。複数はダメ）
  getter /get/g: 'someName',
  setter /set/s: 'someName',
  delete /del/d: 'someName',
  finally/fin/f: (t)=>t.close(),          // 任意
  asserts/ass/a: [                        // 必須
    metArgs, assArgs
  ]
}
testTarget: constructor/method/getter/setter/delete（この5パターンのうちどれか）
*/
class BlackBoxBase {
    constructor(assertion) { this._a = assertion ?? new Assertion() }
    get assertion() { return this._a }
    get defaultOptions() { return {
        context: undefined,
        target: undefined,
        args: [],
        assert: 't',
        assArgs: (r)=>r===true,
        tearDown:(t)=>{},
    } }
}
class BlackBoxFn extends BlackBoxBase {
    constructor(assertion) { super(assertion) }
    test(...args) {
        if (args.length < 2) return
        if (!Type.isFn(args[0])) return
        const l = args.length - 1
        if (Type.isAry(args[l]) && 2===args.length && 2<=args[l][0].length) { this._multi(l, ...args) } // 複数テスト
        else { this._once(l, ...args) } // 単発テスト
    }
    _getOptions(...args) {
        const l = args.length - 1
        if (Type.isAry(args[l]) && 2===args.length && 2<=args[l][0].length) { this._multi(l, ...args) } // 複数テスト
        else { this._once(l, ...args) } // 単発テスト
    }
    _baseOpt(...args) { return ({fn:args[0]}) }
    _once(l, ...args) {
        const op = this._baseOpt(...args)
        const [A, IO] = this._getOnceAsserts(l, ...args)
        op.assert = A
        op.args= IO[0]
        op.assArgs= IO[1]
        this._a[op.assert](...this._getAssertArgs(op))
    }
    _getOnceAsserts(l, ...args) {
        if (2===args.length) {
            if (Type.isFn(args[l])) { return ['t', [[], args[l]]] }
            else if (Type.isErrCls(args[l])) { return ['e', [[], {type:args[l], msg:undefined}]] }
            else if (Type.isErrIns(args[l])) { return ['e', [[], {type:args[l].constructor, msg:args[l].message}]] }
            else { throw new Error(`可変長引数で最初の要素が関数かつ最後の要素が配列でないときで要素数が2のとき、その内容は[fn, args]か[fn, ErrIns]のみ有効です。`) }
        }
        else if (3===args.length) {
            if (Type.isAry(args[1])) {
                     if (Type.isFn(args[l])) {return ['t', [args[1], args[l]]] }
                else if (Type.isErrCls(args[l])) {return ['e', [args[1], {type:args[l], msg:undefined}]] } 
                else if (Type.isErrIns(args[l])) {return ['e', [args[1], {type:args[l].constructor, msg:args[l].message}]] }
                else { throw new Error(`可変長引数でその要素数が3、かつその内容である最初の要素が関数、二番目が配列のとき、三番目の内容は関数か例外型か例外インスタンスであるべきです。`) }
            }
            else if (Type.isErrCls(args[1])) {
                if (Type.isStr(args[l]) || Type.isRegExp(args[l])) { return ['e', [[], {type:args[1], msg:args[l]}]] }
                else { throw new Error(`可変長引数でその要素数が3、かつその内容である最初の要素が関数、二番目が例外型のとき、三番目の内容は例外メッセージ文字列であるべきです。`) }
            }
            else { throw new Error(`可変長引数で最初の要素が関数かつ要素数が3のとき、その内容は[fn, args, assArgs]、[fn, ErrCls, ErrMsg]、[fn, args, ErrIns]のみ有効です。`) }
        }
        else if (4===args.length) {
            if (Type.isAry(args[1]) && Type.isErrCls(args[2]) && (Type.isStr(args[3]) || Type.isRegExp(args[3]))) {return ['e', [args[1], {type:args[2], msg:args[3]}]] }
        }
        else { throw new Error(`可変長引数で最初の要素が関数かつ最後の要素が配列でないとき、可変長引数の要素数は2〜5であるべきです。`) }
    }
    _getAssertArgs(op) {
        const ex = op.assArgs
        if (Type.isAFn(op.fn)) {
            if (Type.isFn(ex)) { return [(async()=>ex(await op.fn(...op.args)))] }
            else if (Type.isObj(ex)) { return [ex.type, ex.msg, (async()=>await op.fn(...op.args))] }
        }
        else if (Type.isFn(op.fn)) {
            if (Type.isFn(ex)) { return [(()=>ex(op.fn(...op.args)))] }
            else if (Type.isObj(ex)) { return [ex.type, ex.msg, (()=>op.fn(...op.args))] }
        }
        throw new Error(`関数テストの引数不正です。引数は正常系[fn, args, testCodeFn]か異常系[fn, Error, 'msg']のいずれかであるべきです。: ${op.fn}, ${ex}`)
    }
    _multi(l, ...args) {
        const op = this._baseOpt(l, ...args)
        for (let io of args[l]) {
            if (!Type.isAry(io)) { throw new Error(`inoutsの要素は配列であるべきです。その内容は[args, expected]です。expectedは正常系ならテストコード関数、異常系なら例外の型・メッセージ文字列です。`) }
            if (io.length < 2) { throw new Error(`inoutの要素数は2以上あるはずです。その内容は[args, expected]です。expectedは正常系ならテストコード関数、異常系なら例外の型・メッセージ文字列です。`) }
            if (!Type.isAry(io[0])) { throw new Error(`inoutの最初は配列であるべきです。これはテスト対象関数に渡す可変長引数を表します。`) }
            const op = this._baseOpt(...args)
            op.fn = args[0]
            op.args = io[0]
            const onceArgs = [op.fn, ...io]
            const [A, IO] = this._getOnceAsserts(onceArgs.length-1, ...onceArgs)
            op.assert = A
            op.assArgs= IO[1]
            this._a[op.assert](...this._getAssertArgs(op))
        }
    }
}
class BlackBoxCls extends BlackBoxBase {
    constructor(assertion) { super(assertion) }
    test(...args) {
        if (args.length < 2) return
        if (!Type.isCls(args[0]) && !Type.isIns(args[0])) return
        const l = args.length - 1
        if (Type.isAry(args[l])) { this._multi(l, ...args) } // 複数テスト
        else { this._once(l, ...args) } // 単発テスト
    }
    _once(l, ...args) {
        const op = this._getOptions(l, ...args)
        this._a[op.assert](...this._getAssertArgs(op))
    }
    _getOptions(l, ...args) { // context, target
        if (2===args.length) {
            // constructor
            if (Type.isCls(args[0])) {
                const o = {context:null, target:args[0], args:[], isConstructor:true}
                return this._getInouts(l, o, ...args)
            }
            // instance
            if (Type.isIns(args[0])) {
                const o = {context:args[0], target:null, args:[], isInstance:true}
                return this._getInouts(l, o, ...args)
            }
            throw new Error(`可変長引数で最初の要素がクラスかインスタンスで要素数が2のとき最後の要素は関数か例外であるべきです。`)
        }
        else if (3===args.length) {
            // constructor
            if (Type.isCls(args[0]) && Type.isAry(args[1])) {
                const o = {context:null, target:args[0], args:args[1], isConstructor:true}
                return this._getInouts(l, o, ...args)
            }
            if (Type.isCls(args[0]) && Type.isErrCls(args[1]) && (Type.isStr(args[l]) || Type.isRegExp(args[l]))) {
                return {context:null, target:args[0], args:[], assert:'e', assArgs:{type:args[1], msg:args[l]}, isConstructor:true}
            }
            // static method（引数なし）
            if (Type.isCls(args[0]) && this._hasMethod(args[0], args[1])) {
                const ctx = args[0]
                const fn = this._getMethodFn(args[0], args[1])
                const o = {context:ctx, target:fn, args:[], isStaticMethod:true}
                return this._getInouts(l, o, ...args)
            }
            const ins = (Type.isCls(args[0]) ? new args[0]() : (Type.isIns(args[0]) ? args[0] : undefined))
            // getter（コンストラクタ引数なし）
            if ((Type.isCls(args[0]) || Type.isIns(args[0]))
                && this._hasGetter(ins, args[1])) {
                const ctx = ins
                const fn = this._getGetterFn(ins, args[1])
                const o = {context:ctx, target:fn, args:[], isGetter:true}
                return this._getInouts(l, o, ...args)
            }
            // インスタンス・メソッド
            if (Type.isIns(args[0]) && this._hasMethod(args[0], args[1])) {
                const ctx = args[0]
                const fn = this._getMethodFn(ctx, args[1])
                const o = {context:ctx, target:fn, args:[], isInstanceMethod:true}
                return this._getInouts(l, o, ...args)
            }
            throw new Error(`可変長引数で最初の要素がクラスかインスタンスで要素数が3のとき、そのテスト対象はコンストラクタ、staticメソッド、ゲッターのいずれかであるべきです。それに相応しい引数ではありませんでした。`)
        }
        else if (4===args.length) {
            // constructor
            if (Type.isCls(args[0]) && Type.isAry(args[1])) {
                if (Type.isErrCls(args[2]) && (Type.isStr(args[l]) || Type.isRegExp(args[l]))) { return {context:null, target:args[0], args:args[1], assert:'e', assArgs:{type:args[2],msg:args[l]}} }
            }
            // static method
            if (Type.isCls(args[0]) && this._hasMethod(args[0], args[1]) && Type.isAry(args[2])) {
                const fn = this._getMethodFn(args[0], args[1])
                const o = {context:args[0], target:fn, args:args[2], isStaticMethod:true}
                return this._getInouts(l, o, ...args)
            }
            if (Type.isCls(args[0]) && this._hasMethod(args[0], args[1]) && Type.isErrCls(args[2]) && (Type.isStr(args[l]) || Type.isRegExp(args[l]))) {
                const fn = this._getMethodFn(args[0], args[1])
                return {context:args[0], target:fn, args:[], assert:'e', assArgs:{type:args[2], msg:args[l]}, isStaticMethod:true}
            }
            const ins = (Type.isCls(args[0]) ? new args[0]() : (Type.isIns(args[0]) ? args[0] : undefined))
            // getter（コンストラクタに引数を渡す）
            if (Type.isCls(args[0]) 
                && this._hasGetter(ins, args[1])
                && Type.isAry(args[2])) {
                const ctx = ins
                const fn = this._getGetterFn(ctx, args[1])
                const o = {context:ctx, target:fn, args:args[2], isGetter:true}
                return this._getInouts(l, o, ...args)
            }
            if (Type.isCls(args[0]) 
                && this._hasGetter(ins, args[1])
                && Type.isErrCls(args[2])
                && (Type.isStr(args[l]) || Type.isRegExp(args[l]))) {
                const ctx = ins
                const fn = this._getGetterFn(ctx, args[1])
                return {context:ctx, target:fn, args:[], assert:'e', assArgs:{type:args[2], msg:args[l]}, isGetter:true}
            }
            // setter
            if (Type.isIns(args[0]) && this._hasSetter(args[0], args[1])) {
                const ctx = args[0]
                const fn = this._getSetterFn(ctx, args[1])
                const o = {context:ctx, target:fn, args:args[2], isSetter:true}
                return this._getInouts(l, o, ...args)
            }
            // instance method
            if (Type.isIns(args[0]) && this._hasMethod(args[0], args[1]) && Type.isAry(args[2]) && !Type.isErrCls(args[l])) {
                const ctx = args[0]
                const fn = this._getMethodFn(ctx, args[1])
                const o = {context:ctx, target:fn, args:args[2], isInstanceMethod:true}
                return this._getInouts(l, o, ...args)
            }
            if (Type.isIns(args[0]) && this._hasMethod(args[0], args[1]) && Type.isAry(args[2]) && Type.isErrCls(args[l])) {
                const ctx = args[0]
                const fn = this._getMethodFn(ctx, args[1])
                return {context:ctx, target:fn, args:args[2], assert:'e', assArgs:{type:args[l], msg:undefined}, isInstanceMethod:true}
            }
            if (Type.isIns(args[0]) && this._hasMethod(args[0], args[1]) && Type.isErrCls(args[2]) && (Type.isStr(args[l]) || Type.isRegExp(args[l]))) {
                const ctx = args[0]
                const fn = this._getMethodFn(ctx, args[1])
                return {context:ctx, target:fn, args:[], assert:'e', assArgs:{type:args[2], msg:args[l]}, isInstanceMethod:true}
            }
            throw new Error(`可変長引数で最初の要素がクラスかインスタンスで要素数が4のとき、その引数が不正でした。`)
        }
        else if (5===args.length) {
            // static method
            if (Type.isCls(args[0]) 
                && this._hasMethod(args[0], args[1])
                && Type.isAry(args[2])
                && Type.isErrCls(args[3])
                && (Type.isStr(args[l]) || Type.isRegExp(args[l]))) {
                const ctx = args[0]
                const fn = this._getMethodFn(ctx, args[1])
                return {context:ctx, target:fn, args:args[2], assert:'e', assArgs:{type:args[3], msg:args[l]}, isStaticMethod:true}
            }
            // setter
            if (Type.isIns(args[0]) 
                && this._hasSetter(args[0], args[1])
                && Type.isErrCls(args[3])
                && (Type.isStr(args[l]) || Type.isRegExp(args[l]))) {
                const ctx = args[0]
                const fn = this._getSetterFn(ctx, args[1])
                return {context:ctx, target:fn, args:args[2], assert:'e', assArgs:{type:args[3], msg:args[l]}, isSetter:true}
            }
            // instance method
            if (Type.isIns(args[0]) 
                && this._hasMethod(args[0], args[1])
                && Type.isAry(args[2])
                && Type.isErrCls(args[3])
                && (Type.isStr(args[l]) || Type.isRegExp(args[l]))) {
                const ctx = args[0]
                const fn = this._getMethodFn(ctx, args[1])
                return {context:ctx, target:fn, args:args[2], assert:'e', assArgs:{type:args[3], msg:args[l]}, isInstanceMethod:true}
            }
            throw new Error(`可変長引数で最初の要素がクラスかインスタンスで要素数が5のとき、その引数が不正でした。`)
        }
        else { throw new Error(`可変長引数の最初がクラスかインスタンスのとき、要素数は3〜5であるべきです。`) }
    }
    _hasGetter(ctx, strOrFn) {
        const fnNm = this._getFnNm(strOrFn)
        return fnNm && Type.hasGetter(ctx, fnNm)
    }
    _getGetterFn(ctx, strOrFn) {
        const fnNm = this._getFnNm(strOrFn)
        const fn1 = ctx.__lookupGetter__(fnNm).bind(ctx)
        if (Type.isFn(fn1)) return fn1
        return Type._getDesc(ctx, fnNm)['get'].bind(ctx)
    }
    _hasSetter(ctx, strOrFn) {
        const fnNm = this._getFnNm(strOrFn)
        return fnNm && Type.hasSetter(ctx, fnNm)
    }
    _getSetterFn(ctx, strOrFn) {
        const fnNm = this._getFnNm(strOrFn)
        const fn1 = ctx.__lookupSetter__(fnNm).bind(ctx)
        if (Type.isFn(fn1)) return fn1
        return Type._getDesc(ctx, fnNm)['set'].bind(ctx)
    }
    _hasMethod(ctx, strOrFn) {
        const fnNm = this._getFnNm(strOrFn)
        return (fnNm
            && !Type.hasGetter(ctx, fnNm) 
            && !Type.hasSetter(ctx, fnNm) 
            && Type.isFn(ctx[fnNm]))
    }
    _getFnNm(strOrFn) { return Type.isStr(strOrFn) ? strOrFn : (Type.isFn(strOrFn) ? strOrFn.name : undefined) }
    _getMethodFn(ctx, strOrFn) { return ctx[this._getFnNm(strOrFn)].bind(ctx) }
    _hasFn(ctx, strOrFn) {
        if (Type.isStr(args[1]) 
            && !Type.hasGetter(args[0], args[1]) 
            && !Type.hasSetter(args[0], args[1]) 
            && Type.isFn(args[0][args[1]])) { return true }
        if (Type.isFn(args[1]) 
            && !Type.hasGetter(args[0], args[1].name) 
            && !Type.hasSetter(args[0], args[1].name) 
            && Type.isFn(args[0][args[1].name])) { return true }
        return false
    }
    _getFn(ctx, strOrFn) {
        const fnNm = this._getFnNm(strOrFn)
        try { return ctx[fnNm].bind(ctx) } catch(e) { return undefined }
        throw new Error(`_getFnの第二引数は文字列か関数であるべきです。`)
    }
    _getInouts(l, o, ...args) {
        if (Type.isErrCls(args[l])) { return {...o, assert:'e', assArgs:{type:args[l],msg:undefined}} }
        if (Type.isErrIns(args[l])) { return {...o, assert:'e', assArgs:{type:args[l].constructor, msg:args[l].message}} }
        if (Type.isFn(args[l])) { return {...o, assert:'t', assArgs:args[l]} }
        throw new Error(`inoutの最後の要素は関数か例外であるべきです。`)
    }
    _getAssertArgs(op) {
        const ex = op.assArgs
        if (Type.isAFn(op.target)) {
            if (Type.isFn(ex)) { return [(async()=>ex(await op.target(...op.args)))] }
            else if (Type.isObj(ex)) { return [ex.type, Type.isNU(ex.msg) ? '' : ex.msg, (async()=>await op.target(...op.args))] }
        }
        else if (Type.isFn(op.target)) {
            if (Type.isFn(ex)) { return [(()=>ex(this._getRunFn(op)))] }
            else if (Type.isObj(ex)) { return [ex.type, Type.isNU(ex.msg) ? '' : ex.msg, (()=>op.target(...op.args))] }
        }
        else if (Type.isCls(op.target)) {
            if (Type.isFn(ex)) { return [(()=>ex(new op.target(...op.args)))] }
            else if (Type.isObj(ex)) { return [ex.type, Type.isNU(ex.msg) ? '' : ex.msg, (()=>new op.target(...op.args))] }
        }
        else if (null===op.target && Type.isIns(op.context) && Type.isFn(ex)) { return [()=>ex(op.context)] }
        throw new Error(`関数テストの引数不正です。引数は正常系[fn, args, testCodeFn]か異常系[fn, Error, 'msg']のいずれかであるべきです。: ${op.fn}, ${ex}`)
    }
    _getRunFn(op) {
        if (op.isSetter) { op.target(op.args); return op.context; }
        return op.target(...op.args)
    }
    _multi(l, ...args) {
        let context = args[0]
        let target = (Type.isStr(args[1]) || Type.isFn(args[1])) ? this._getFn(args[0], args[1]) : (Type.isCls(args[0]) ? args[0] : undefined)
        if (undefined===target) {
            if (Type.isCls(context) && (Type.isStr(args[1]) || Type.isFn(args[1]))) {
                const ins = new args[0]()
                if (!this._hasGetter(ins, args[1])) {throw new Error(`可変長引数で最後の要素が配列のとき、二番目の要素は関数かその名前でるべきです。最初の要素がコンストラクタのときはゲッターも許可しますが存在しません。`) }
            }
        }
        if (!Type.isRange(args.length, 2, 3)) { throw new Error(`可変長引数で最後の要素が配列のとき、可変長引数の要素数は2か3のいずれかであるべきです。すなわち[context, patterns]か[context, target, patterns]です。`) }
        for (let io of args[l]) {
            if (!Type.isAry(io)) { io = [io] }
            const ARGS = (3===args.length) ? [context, args[1], ...io] : [context, ...io]
            this._once(ARGS.length-1, ...ARGS)
        }
    }
}
class BlackBox {
    constructor(assertion) {
        this._a = assertion ?? new Assertion()
        this._fn = new BlackBoxFn(this._a)
        this._cls = new BlackBoxCls(this._a)
    }
    test(...args) {
        if (args.length < 2) { throw new Error(`可変長引数の要素数は2以上あるべきです。[target, assArgs]等。`) }
        if (Type.isFn(args[0])) { this._fn.test(...args) }
        else if (Type.isCls(args[0]) || Type.isIns(args[0])) { this._cls.test(...args) }
        else { throw new Error(`可変長引数の最初の要素は関数かクラスかインスタンスであるべきです。`) }
    }
    fin() { this._a.fin() }
    get assertion() { return this._a }
}
window.BlackBox = BlackBox
})()
