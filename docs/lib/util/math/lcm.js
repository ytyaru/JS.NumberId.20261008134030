Object.defineProperty(Math, 'lcm', { // 最小公倍数
    value(...args) {
        [...args].map(a=>Number.isInteger(a) ? a : (()=>{throw new TypeError(`Contains a value that is not an integer.`)})())
        const a = arguments;
        const g = (n, m) => m ? g(m, n % m) : n;
        const l = (n, m) => n * m / g(n, m);
        let ans = a[0];
        for (var i = 1; i < a.length; i++) { ans = l(ans, a[i]); }
        return ans;
    }
})
