Array.times = function(num, fn, params) { // num回数だけfnを実行する
    if (params) { return [...Array(num)].map((_,i)=>fn(i, ...params)) }
    else { return [...Array(num)].map((_,i)=>fn(i)) }
}
