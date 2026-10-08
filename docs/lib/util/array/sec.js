Array.sec = function(N, step=1, init=0) {// N:個数, step:増加値, init:初期値
    [N, step, init].map(v=>{
        if (!Number.isInteger(v)) {throw new TypeError(`引数は整数値であるべきです。N:${N}, step:${step}, init:${init}`)}
    });
    if (N < 0) {throw new TypeError(`引数Nは0以上であるべきです。`)}
    return [...new Array(N)].map((_,i)=>init+(i*step))
}
