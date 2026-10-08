(function() {
String.prototype.toElement = function() {
    console.log(this)
    const el = document.createElement('div')
    el.innerHTML = this.trim()
    return el.firstChild
}
String.prototype.toNodes = function() {
    const el = document.createElement('div')
    el.innerHTML = this
    return el.childNodes
}
})()

