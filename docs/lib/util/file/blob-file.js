// https://github.com/ytyaru/Html.Download.Blob.File.20220422170713
class BlobFile {
    static download(blob, name='some.txt') {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        document.body.appendChild(a);
        a.download = name || this.timestamp() + '.txt';
        a.href = url;
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
    }
}
