class Fraction { // 分数
    static of(top, bottom, options) { return new Fraction(top, bottom, options) }
    constructor(top, bottom, options) {
        this.top = top;
        this.bottom = bottom;
        if (Type.isObj(options)) {
            this._within = options.hasOwnProperty('within') ? !!options.within : false;    // 分子は分母を超過不可
            this._canZero = options.hasOwnProperty('canZero') ? !!options.canZero : false; // 分子は0を代入可能
        }
    }
    get top() { return this._top }
    get bottom() { return this._bottom }
    get float() { return this._top / this._bottom }
    get str() { return `${this._top}/${this._bottom}` }
    get ints() { return [this._top, this._bottom] }
    get rate() { return this.top===this.bottom ? 100 : (0===this.top ? 0 : this.float*100)}  // N%
    get ratio() { return 1===this.top ? this.bottom : this.bottom/this.top } // 1:N
//    set top(v) { if (Number.isInteger(v) && 0<=v) { this._top = v } else {throw new TypeError()} }
    set top(v) {
        if (Number.isInteger(v)) {
            if (this._within && this._bottom < v) {throw new RangeError('Top is over bottom.')}
            else if (0===v && !this._canZero) {throw new RangeError(`Zero can't be assigned for top.`)}
            else {this._top = v}
        } else {throw new TypeError('Top is not integer.')} }
    set bottom(v) { if (Number.isInteger(v) && 0<v) { this._bottom = v } else {throw new TypeError('Bottom is not positive integer.')} }
    eq(v) { this.throwType(v); return this.top === v.top && this.bottom === v.bottom; }
    g(v) { this.throwType(v); return v.float < this.float; }
    l(v) { this.throwType(v); return this.float < v.float; }
    ge(v) { this.throwType(v); return v.float <= this.float; }
    le(v) { this.throwType(v); return this.float <= v.float; }
    throwType(v) {if(Fraction!==v.constructor){throw new TypeError()}}
}

