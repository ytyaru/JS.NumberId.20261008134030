String.prototype.insert = function(i, s) { return this.slice(0, i) + s + this.slice(i) }
String.prototype.remove= function(i, l=1) { return this.slice(0, i) + this.slice(i+l) }
