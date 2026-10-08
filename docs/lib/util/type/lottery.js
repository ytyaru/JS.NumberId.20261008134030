(function(){
class Lottery {// 抽選（割合）
    // 0〜weights.length-1までの整数値を一つ返す。但しその出現率は引数の配列weightsで指定する。
    draw(weights) {// [6,3,1] 0:6/10, 1:3/10, 2:1/10  [1,1,1] 0:1/3, 1:1/3, 2:1/3   0が含む場合はバグる！[0,0,1] 0:0, 1:0, 2:1
        this.#validW(weights);
        const Cs = this.#Cs(weights);
        const S = this.#weightSum(weights)
        const c = this.#c(Cs, S);
        return Cs[c].i;
    }
    #c(Cs, S) {// 候補の添字を一つ返す
        const V = Random.I(S); // 0〜S-1
        for (let i=0; i<Cs.length; i++) {
            const W = Cs.slice(0,i+1).reduce((s,v,i)=>s+v.w, 0);
            if (V < W) {return i}
        }
        throw new Error(`このコードは実行されないはず。もし実行されたら論理エラー。ロジックを組み直すべき。`)
    }
    // 0〜weights.length-1までの整数値をNつ返す。但しその出現率は引数の配列weightsで指定する。
    draws(weights, N=undefined) {
        this.#validW(weights);
        const Cs = this.#Cs(weights);
        const S = this.#weightSum(weights)
        const cs = [...new Array(Number.isInteger(N) ? N : S)].map(_=>this.#c(Cs, S));
        return cs.map(c=>Cs[c].i);
    }
    #validW(Ws){if (!Array.isArray(Ws) || !Ws.every(v=>Number.isInteger(v) && 0<=v)) {throw new TypeError(`引数は0以上な整数の配列のみ有効です。`)}}
    #Cs(Ws){return Ws.map((w,i)=>({i:i, w:w})).filter(v=>0<v.w);}// Candidations [[i,w],...,[i,w]]
    #weightSum(Ws) {
        const S = Ws.reduce((s,v,i)=>s+v, 0);
        if (S<1) {throw new TypeError(`引数の合計は1以上になるべきです。`)}
        return S;
    }
}
window.Lottery = new Lottery();
})();
