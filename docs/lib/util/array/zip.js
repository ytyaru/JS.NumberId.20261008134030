// zip()　同じindexにある値の組合せ配列を作る
// https://yucatio.hatenablog.com/entry/2020/02/06/085930
Array.zip = function(...arys) { // a1:[x1,x2,...], a2:[y1,y2,...], aN:[...], return:[[x1,y1,z1], [x2,y2,z2], ...]
    const len = Math.min(...(arys.map(a=>a.length)))
    return new Array(len).fill().map((_, i)=>arys.map(a=>a[i]))
}
Array.prototype.zip = function(...arys) {return Array.zip(this, ...arys)}

/*
// 直積・積集合・デカルト積（全パターン網羅）
// https://qiita.com/yama-t/items/d533f3385a53f887a3b0
// https://ja.wikipedia.org/wiki/%E7%9B%B4%E7%A9%8D%E9%9B%86%E5%90%88
// https://guccyon-2.hatenadiary.org/entry/20080227/p1
Array.product = function(...arys) { // a1:[k1,k2,...], a2:[v1,v2,...], return:[[k1,v1],[k2,v2],...]
    if(arys.length == 1) return arys[0];
    const rprod = Array.product.apply(null, Array.prototype.slice.call(arys,1));
    return arys[0].map((m)=>rprod.map((n)=>[m].concat(n))).flat();
}
Array.prototype.product = function(...arys) {return Array.product(this, ...arys)}
*/
/*
Array.product = function(a1, a2) { // a1:[k1,k2,...], a2:[v1,v2,...], return:[[k1,v1],[k2,v2],...]
    return a1.reduce((ary, v1) => {
        a2.forEach(v2=>ary.push([].concat(v1,v2)))
        return ary;
    }, []);
}
*/
/*
*/
/*
Array.prototype.zip = function(a2) {
    return this.reduce((self, v1) => {
        a2.forEach(v2=>self.push([].concat(v1,v2)))
        return self;
    }, this);
}
*/

// https://yucatio.hatenablog.com/entry/2020/02/06/085930
//const zip = (...arrays) => {
//  const length = Math.min(...(arrays.map(arr => arr.length)))
//  return new Array(length).fill().map((_, i) => arrays.map(arr => arr[i]))
//}

