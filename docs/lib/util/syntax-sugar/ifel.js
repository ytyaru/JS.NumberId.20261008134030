function ifel(...args) {
    if (args.length<2) { throw TypeError(`引数は2つ以上必要です。[condFn1, retFn1, condFn2, retFn2, ..., defFn]`) }
    const setNum = Math.floor(args.length/2);
    for (let i=0; i<setNum*2; i+=2) {
        const cond = !!(('function'===typeof args[i]) ? args[i]() : args[i])
        if (cond) { return ('function'===typeof args[i+1]) ? args[i+1]() : args[i+1] }
    }
    if (setNum*2<args.length) { return ('function'===typeof args[setNum*2]) ? args[setNum*2]() : args[setNum*2] }
}
