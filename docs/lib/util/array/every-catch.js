Array.prototype.everyCatch = fuction(fn, catchFn) {
    for (let i=0; i<this.length; i++) {
        if (fn(this[i], i)) { continue }
        else { if(Type.isFn(catchFn)) { catchFn(this, i) } else { throw new Error(`False on ${i} index: ${this[i]}`) } }
    }
}
