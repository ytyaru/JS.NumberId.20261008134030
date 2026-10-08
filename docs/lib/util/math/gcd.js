Object.defineProperty(Math, 'gcd', { // 最大公約数
    value(...args) {
        [...args].map(a=>Number.isInteger(a) ? a : (()=>{throw new TypeError(`Contains a value that is not an integer.`)})())
        console.log([...args], Number.isInteger(args[0]))
        const f = (a, b) => b ? f(b, a % b) : a;
        let ans = args[0];
        for (let i=1; i<args.length; i++) { ans = f(ans, args[i]); }
        return ans;
    }
});
/*
Math.gcd = function(...args) { // 最大公約数
    [...args].map(a=>Number.isInteger(a) ? a : (()=>{throw new TypeError(`Contains a value that is not an integer.`)}))
    const f = (a, b) => b ? f(b, a % b) : a;
    let ans = args[0];
    for (let i=1; i<args.length; i++) { ans = f(ans, args[i]); }
    return ans;
}
*/
