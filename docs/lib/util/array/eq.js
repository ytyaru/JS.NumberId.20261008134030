// 一致確認（参照、型、要素数、要素値(順序や型も含む)が、一致するか否か）
// Array
Array.prototype.eqReference = function(v) { return this===v; } // 参照先が一致する
Array.prototype.eqType = function(v) { return v instanceof this.constructor } // 型が一致する
Array.prototype.eqLength = function(v) { const vs=[this,v].map(V=>V[['length','size'].find(n=>n in V)]); console.log(vs); return vs[0]===vs[1]; } // 長さが一致する
Array.prototype.eqSize = Array.prototype.eqLength; // 長さが一致する
Array.prototype.eqValue = function(v) { return this.eqType(v) && this.eqLength(v) && this.every((V,i)=>V===v[i]); } // 値が一致する
// 短縮3
Array.prototype.eqRef = Array.prototype.eqReference;
Array.prototype.eqTyp = Array.prototype.eqType;
Array.prototype.eqLen = Array.prototype.eqLength;
Array.prototype.eqSiz = Array.prototype.eqSize;
Array.prototype.eqVal = Array.prototype.eqValue;
// 短縮1
Array.prototype.eqR = Array.prototype.eqReference;
Array.prototype.eqT = Array.prototype.eqType;
Array.prototype.eqL = Array.prototype.eqLength;
Array.prototype.eqS = Array.prototype.eqSize;
Array.prototype.eqV = Array.prototype.eqValue;

// Map
Map.prototype.eqReference = function(v) { return this===v; } // 参照先が一致する
Map.prototype.eqType = function(v) { return v instanceof this.constructor } // 型が一致する
Map.prototype.eqLength = function(v) { const vs=[this,v].map(V=>V[['length','size'].find(n=>n in V)]); return vs[0]===vs[1]; } // 長さが一致する
Map.prototype.eqSize = Map.prototype.eqLength; // 長さが一致する
Map.prototype.eqValue = function(v) { return this.eqType(v) && this.eqLength(v) && [...this.keys()].every(k=>v.has(k) && v.get(k)===this.get(k)); } // 値が一致する
// 短縮3
Map.prototype.eqRef = Map.prototype.eqReference;
Map.prototype.eqTyp = Map.prototype.eqType;
Map.prototype.eqLen = Map.prototype.eqLength;
Map.prototype.eqSiz = Map.prototype.eqSize;
Map.prototype.eqVal = Map.prototype.eqValue;
// 短縮1
Map.prototype.eqR = Map.prototype.eqReference;
Map.prototype.eqT = Map.prototype.eqType;
Map.prototype.eqL = Map.prototype.eqLength;
Map.prototype.eqS = Map.prototype.eqSize;
Map.prototype.eqV = Map.prototype.eqValue;

// Set
Set.prototype.eqReference = function(v) { return this===v; } // 参照先が一致する
Set.prototype.eqType = function(v) { return v instanceof this.constructor } // 型が一致する
Set.prototype.eqLength = function(v) { const vs=[this,v].map(V=>V[['length','size'].find(n=>n in V)]); return vs[0]===vs[1]; } // 長さが一致する
Set.prototype.eqSize = Set.prototype.eqLength; // 長さが一致する
Set.prototype.eqValue = function(v) { return this.eqType(v) && this.eqLength(v) && [...this].every(V=>v.has(V)); } // 値が一致する
// 短縮3
Set.prototype.eqRef = Set.prototype.eqReference;
Set.prototype.eqTyp = Set.prototype.eqType;
Set.prototype.eqLen = Set.prototype.eqLength;
Set.prototype.eqSiz = Set.prototype.eqSize;
Set.prototype.eqVal = Set.prototype.eqValue;
// 短縮1
Set.prototype.eqR = Set.prototype.eqReference;
Set.prototype.eqT = Set.prototype.eqType;
Set.prototype.eqL = Set.prototype.eqLength;
Set.prototype.eqS = Set.prototype.eqSize;
Set.prototype.eqV = Set.prototype.eqValue;

