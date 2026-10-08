// コールバック地獄を直列呼出する（先に実行した関数の戻り値が、次の関数への引数になる）
// c(b(a(1)))
// a.series([1], b, c)
Function.prototype.series = function(args, ...cbFns) {
    if (!Array.isArray(args)) { args = [args] }
    let ret = this(...args)
    for(let i=0; i<cbFns.length; i++) {
        if ('function'!==typeof cbFns[i]) { throw new TypeError(`${i+1}番目の引数は関数のみ有効です。: ${typeof cbFns[i]}`) }
        if (!Array.isArray(ret)) { ret = [ret] }
        ret = cbFns[i](...ret)
    }
    return ret
}
