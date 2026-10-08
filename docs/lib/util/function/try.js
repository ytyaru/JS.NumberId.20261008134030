Function.prototype.try = function(...args) {
    if (args.length < 2) { throw new TypeError(`引数は2個以上必要です。`) }
    const l = args.length;
    const [catchFn, finallyFn, fnArgs] = [args[l-2], args[l-1], args.slice(0, l-2)];
    [[catchFn, `引数の最後より一つ前はcatch関数であるべきです。`], [finallyFn, `引数の最後はfinally関数であるべきです。`]].map(v=>{if ('function'!==typeof v[0]) { throw new TypeError(v[1]) }})
    try { return this(...fnArgs) }
    catch(e) { return catchFn(e) }
    finally { finallyFn() }
}
Function.prototype.catch = function(...args) { return this.try(...args, ()=>{}) }
Function.prototype.finally = function(...args) { return this.try(...args.slice(0, -1), (e)=>{throw e}, args[args.length-1]) }

