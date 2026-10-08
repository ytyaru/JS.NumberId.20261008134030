String.prototype.escapeHtml = function() {
    return this.replace(/[&'`"<>]/g, (match)=>{
        return {
            '&': '&amp;',
            "'": '&#39;',
            '`': '&#96;',
            '"': '&quot;',
            '<': '&lt;',
            '>': '&gt;',
        }[match]
    });
}
String.prototype.unescapeHtml = function() {
    return this.replace(/(&amp;|&#39;|&#x27;|&#96;|&#x60;|&quot;|&lt;|&gt;)/g, (match)=>{
        return {
            '&amp;': '&',
            '&#39;': "'",  // ' 10進数
            '&#x27;': "'", // ' 16進数
            '&#96;': '`',  // ` 10進数
            '&#x60;': '`', // ` 16進数
            '&quot;': '"',
            '&lt;': '<',
            '&gt;': '>',
        }[match]
    });
}
