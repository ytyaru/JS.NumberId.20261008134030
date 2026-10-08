// const res = fetch(url); const txt = res.text(); console.log(txt);
// fetch(url).then(res=>res.text()).then(txt=>console.log(txt))
// fetch.series([url], [(...res)=>res[0].text(), (...txt)=>console.log(txt[0])], catchFn, finallyFn)
//Promise.prototype.series = function(args, cbFns, catchFn, finallyFn) { // Promiseを直列実行する
/*
Promise.prototype.series = function(args, cbFns) { // Promiseを直列実行する
    if (!Array.isArray(args)) { throw new Error(`第一引数argsは可変長引数を表す配列であるべきです。[arg0, arg1, ...]`) }
    if (!Array.isArray(cbFns)) { throw new Error(`第二引数cbFnssは関数とその引数の組合せ配列の配列であるべきです。[[fn,args],...]`) }
    let promise = this(...args)
    for(let i=0; i<cbFns.length; i++) {
        promise = promise.then((...res)=>cbFns[i][0](...res))
    }
    return promise
//    for(var i = 0; i < 3; i++) {
//        promise = promise.then(task1.bind(this, i))
//    }
}
*/
// const res = fetch(url); const txt = res.text(); console.log(txt);
// fetch(url).then(res=>res.text()).then(txt=>console.log(txt))
// fetch(url).series(res=>res.text(), txt=>console.log(txt))
Promise.prototype.series = function(...cbFns) { // Promiseを直列実行する
//    if (!Array.isArray(args)) { throw new Error(`第一引数argsは可変長引数を表す配列であるべきです。[arg0, arg1, ...]`) }
//    if (!Array.isArray(cbFns)) { throw new Error(`第二引数cbFnssは関数とその引数の組合せ配列の配列であるべきです。[[fn,args],...]`) }
    if (!Array.isArray(cbFns)) { throw new Error(`引数cbFnssは関数の可変長配列であるべきです。cbFn1, cbFn2,...`) }
    let promise = this
    for(let i=0; i<cbFns.length; i++) {
        promise = promise.then((...res)=>cbFns[i](...res))
    }
    return promise


/*
    let r = []
    for(let i=0; i<cbFns.length; i++) {
        //promise = promise.then((...res)=>cbFns[i](...res))
        //promise = promise.then((...res)=>i===cbFns.length-1 ? Promise.resolve(cbFns[i](...res)) : cbFns[i](...res))
        //promise = promise.then((...res)=>i===cbFns.length-1 ? : cbFns[i](...res))
        console.log(i, r)
        if (i===cbFns.length-1) { return Promise.resolve(cbFns[i](...r)) }
        //else { promise = promise.then((...res)=>cbFns[i](...res)) }
        else { promise = promise.then((...res)=>{r=res;return cbFns[i](...res)}) }
    }
*/




//    for(var i = 0; i < 3; i++) {
//        promise = promise.then(task1.bind(this, i))
//    }
}
Promise.prototype.seriesAsync = async function(...cbFns) { // Promiseを直列実行する
    if (!Array.isArray(cbFns)) { throw new Error(`引数cbFnssは関数の可変長配列であるべきです。cbFn1, cbFn2,...`) }
    //let ret = await this(...args)
    let ret = await this
    for(let i=0; i<cbFns.length; i++) {
        if ('function'!==typeof cbFns[i]) { throw new TypeError(`${i+1}番目の引数は関数のみ有効です。: ${typeof cbFns[i]}`) }
        if (!Array.isArray(ret)) { ret = [ret] }
        if ('AsyncFunction'===cbFns[i].constructor.name) { ret = await cbFns[i](...ret) }
        else if ('Function'===cbFns[i].constructor.name) { ret = cbFns[i](...ret) }
        else { throw new TypeError(`${i+1}番目の引数はFunctionかAsyncFunction型のみ有効です。: ${cbFns[i].constructor.name}`) }
    }
    return ret
}
