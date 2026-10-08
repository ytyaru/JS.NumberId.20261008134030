Number.prototype.isRange = function(start, end) { [start, end] = [start, end].sort((a, b) => a - b); return (this <= end && start <= this) }
//Number.prototype.range = function(start, end) { [start, end] = [start, end].sort((a, b) => a - b); return [...Array((end - start) + 1)].map((_, i) => start + i) }
Number.prototype.range = function(end) { [start, end] = [this, end].sort((a, b) => a - b); return [...Array((end - start) + 1)].map((_, i) => start + i) }
Number.range = function(start, end) { [start, end] = [start, end].sort((a, b) => a - b); return [...Array((end - start) + 1)].map((_, i) => start + i) }
