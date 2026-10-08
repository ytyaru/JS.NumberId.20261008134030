Function.prototype.runs = function(argsList) {
    const rs = []
    for (let args of argsList) { rs.push(this(...args)) }
    return rs
}
