function deepCopy(obj) { // https://qiita.com/knhr__/items/d7de463bf9013d5d3dc0
    const channel = new MessageChannel()
    const inPort = channel.port1
    const outPort = channel.port2
    return new Promise(resolve => {
        inPort.onmessage = data => { resolve(data.data) }
        outPort.postMessage(obj)
    })
}
// deepCopy(obj).then(console.log)
// const obj2 = await deepCopy(obj)
// 理想は標準APIのstructuredClone()だが、私の環境では使えなかった
// https://developer.mozilla.org/ja/docs/Web/API/structuredClone
