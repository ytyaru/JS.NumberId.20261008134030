function match(...exps) { // 条件式1, 結果式1, 条件式2, 結果式2, ..., 最後は結果式のみ
    if (0===exps.length) { return undefined }
    if (0===(exps.length % 2)) { throw new Error(`match式の引数は奇数個にしてください：条件式1, 結果式1, 条件式2, 結果式2, ..., 最後は結果式のみ。`) }
    const isFn = (v)=>'function'===typeof v
    const run = (v)=>isFn(v) ? v() : v
    for (let i=0; i<exps.length; i+=2) {
        const res = run(exps[i])
        if (res) { return (i+1<exps.length) ? run(exps[i+1]) : res }
    }
    return run(exps.slice(-1)[0]) // 必ず最後の式を返す（switch の default）
}
