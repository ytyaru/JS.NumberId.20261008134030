// HTML要素に以下プロパティを追加する
// isUserInput           get     ユーザ入力要素か否か
// hasUserInputableValue get     ユーザ入力可能な値を持っている要素か否か
// jsonValue             get/set valueを適切な型に変換して返す/valueに値をセットする
Object.defineProperty(HTMLElement.prototype, 'isUserInput', { get: function() { // ユーザ入力要素であるか否か
    const tagName = this.tagName.toLowerCase()
    if (['textarea','select','input'].some(v=>v===tagName)) { return true }
    const contenteditable = this.hasAttribute('contenteditable')
    if (this.contenteditable) { return true }
    return false
}})
Object.defineProperty(HTMLElement.prototype, 'hasUserInputableValue', { get: function() { // ユーザ入力可能な値を持っている要素か否か
    const tagName = this.tagName.toLowerCase()
    const contenteditable = this.hasAttribute('contenteditable')
    if (['textarea','select'].some(v=>v===tagName)) { return true }
    else if ('input'===tagName) {
        const t = this.getAttribute('type')
        const type = (t) ? t.toLowerCase() : 'text'
        console.log('type:',type)
        if (['file','button','submit','reset','image'].some(v=>v===type)) { console.log(type); return false }
        //if (['file','button','submit','reset','image'].some(v=>v!==type)) { return true }
        return true
    }
    else if ('button'===tagName) { return false }
    else if (contenteditable) { return true }
    return false
}})
Object.defineProperty(HTMLElement.prototype, 'jsonValue', {
    get: function() { // valueを適切な型に変換して返す
        if (!this.hasUserInputableValue) { return undefined }
        const tagName = this.tagName.toLowerCase()
        if (['textarea','select'].some(v=>v===tagName)) { return this.value }
        if ('input'===tagName) {
            const type = this.getAttribute('type').toLowerCase()
            if ('checkbox'===type) { return this.checked }
            if (['number','range'].some(v=>v===type)) { return Number(this.value) }
            if ('radio'===type) {
                const sameGroupRadios = document.querySelectorAll(`input[type="radio"][data-sid="${this.dataset.sid}"][data-eid="${this.dataset.eid}"]`)
                console.debug('sameGroupRadios:', sameGroupRadios)
                if (!sameGroupRadios) { return null }
                const checkedRadios = Array.from(sameGroupRadios).filter(radio=>radio.checked)
                console.debug('checkedRadios:', checkedRadios)
                return ((0===checkedRadios.length) ? null : checkedRadios[0].value)
            }
            return this.value
        }
        const contenteditable = this.hasAttribute('contenteditable')
        if (contenteditable) { return this.innerText } // innerHTML ?
        return undefined
    },
    set: function(v) { // valueに値をセットする
        if (!this.hasUserInputableValue) { return }
        const tagName = this.tagName.toLowerCase()
        if (['textarea','select'].some(v=>v===tagName)) { this.value = v }
        if ('input'===tagName) {
            const type = this.getAttribute('type').toLowerCase()
            if ('file'===type) { return } // value に値をセットするとエラーになる（非対応）
            else if ('checkbox'===type) { this.checked = v }
            else if (['number','range'].some(v=>v===type)) { this.value = v }
            else if ('radio'===type) {
                const radio = document.querySelector(`input[type="radio"][data-sid="${this.dataset.sid}"][data-eid="${this.dataset.eid}"][value="${v}"]`)
                if (radio) { radio.checked = true }
            }
            else { this.value = v }
        }
        const contenteditable = this.hasAttribute('contenteditable')
        if (contenteditable) { this.innerText = v } // innerHTML ?
    },
})

