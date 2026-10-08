Array.prototype.toObject = function() {
    if (!this.every(v=>Array.isArray(v) && 2<=v.length)) { throw new TypeError(`[[key, value],...]であるべきです。`) }
    return Object.assign(...this.map(([k,v]) => ({[k]:v})))
}
