class TextFile extends BlobFile {
    static download(text, name='some.txt', newline='LF', hasBom=false) {
        BlobFile.download(this.createUtf8Blob(text, newline='LF', hasBom=false), name)
    }
    static createUtf8Blob(text, newline='LF', hasBom=false) {
        const content = []
        if (hasBom) { content.push(new Uint8Array([0xEF, 0xBB, 0xBF])); }
        content.push(this.replaceNewLine(text, newline))
        return new Blob(content, {type: 'text/plain'})
    }
    static replaceNewLine(text=null, newline='LF') {
        const content = (text) ? text : document.getElementById('content').value;
        console.debug('newline: ', newline)
        switch (newline) {
            case 'LF': return content;
            case 'CR': return content.replace(/\r\n|\n/g, "\r");
            case 'CR-LF': return content.replace(/\r|\n/g, "\r\n");
            default: return content;
        }
    }
}
