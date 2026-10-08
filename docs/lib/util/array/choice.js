Array.prototype.choice = function() {
    const R = (()=>{// 乱数 Real number 実数 0.0〜1.0
        const A = new Uint32Array(1);
        crypto.getRandomValues(A);
        return A[0] / (0xFFFFFFFF + 1); // 0.0〜1.0
    })();
    return this[R * this.length];
}
