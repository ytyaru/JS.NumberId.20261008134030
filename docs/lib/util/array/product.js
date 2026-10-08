// 直積・積集合・デカルト積（全パターン網羅）
// https://guccyon-2.hatenadiary.org/entry/20080227/p1
Array.product = function(...arys) { // a1:[k1,k2,...], a2:[v1,v2,...], return:[[k1,v1],[k2,v2],...]
    if(0 === arys.length) throw new TypeError(`The argument must be one or more arrays.`)
    if(1 === arys.length) return arys[0];
    const rprod = Array.product.apply(null, Array.prototype.slice.call(arys,1));
    return arys[0].map((m)=>rprod.map((n)=>[m].concat(n))).flat();
}
Array.prototype.product = function(...arys) {return Array.product(this, ...arys)}

