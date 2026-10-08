class Assert { // テストする。例外発生を殺してconsole.errorに変換する。処理を止めずに実行できる。
    static ok(valueOrFn) { // 正常系テスト。成功なら真、失敗なら偽を返す。
        try {
            const isSuccess = this._getActual(valueOrFn)
            if (!isSuccess) this._errorStack(`テスト失敗。真であるべき所が偽である。`, this.ok)
            return isSuccess 
        }
        catch (err) {this._errorStack(`テスト失敗。真であるべき所で例外発生した。`, this.ok); return false;}
    }
    static no(valueOrFn) { // 正常系テスト。成功なら真、失敗なら偽を返す。
        try {
            const isSuccess = this._getActual(valueOrFn)
            if ( isSuccess) this._errorStack(`テスト失敗。偽であるべき所が真である。`, this.ok)
            return !isSuccess 
        }
        catch (err) {this._errorStack(`テスト失敗。偽であるべき所で例外発生した。`, this.ok); return false;}
    }
    /*
    */
    /*
    static ok(valueOrFn) { return this._okno(valueOrFn) }      // 正常系テスト。引数が真なら成功でtrueを返す。それ以外はfalse。
    static no(valueOrFn) { return this._okno(valueOrFn, true) }// 正常系テスト。引数が偽なら成功でtrueを返す。それ以外はfalse。
    static _okno(valueOrFn, isNo) {
        const actual = this._getActual(valueOrFn)
        const isSuccess = isNo ? actual : !actual
        try {
//            const isSuccess = this._getActual(valueOrFn)
//            if (!isSuccess) this._errorStack(`テスト失敗。真であるべき所が偽である。`, this.ok)
            if ( isSuccess) this._errorStack(this._oknoMsg(isNo), this.ok)
            return isSuccess 
        }
//        catch (err) {this._errorStack(`テスト失敗。真であるべき所で例外発生した。`, this.ok); return false;}
        catch (err) {this._errorStack(this._oknoMsg(isNo, true), this.ok); return false;}
    }
    static _oknoMsg(isNo, isThrow) {
        const cslMsg = ['真','偽']
        if (isNo) cslMsg.reverse()
        const [expected, actual] = cslMsg
        return `テスト失敗。${expected}であるべき所` + isThrow ? 'で例外発生した。' : `が${actual}である。`
    }
    */
    static error(type, msg, fn) { // 例外発生テスト。
        try { fn() }
        catch(err) {
            const cslMsg = this._makeErrorMessage(type, msg, err)
            if (cslMsg) { console.error(cslMsg, err); return false; }
            return true
        }
        this._errorStack(`テスト失敗。エラーになるべき所でエラーにならなかった。`, this.error)
        return false
    }
    static _makeErrorMessage(type, msg, err) {
        const isMatchName = type.name===err.name
        const isMatchMessage = this._matchErrorMessage(msg, err.message)
        console.log(isMatchName, isMatchMessage)
        const msgs = [isMatchName ? null :  this._errMsgType(type, err),
                      isMatchMessage ? null : this._errMsgMsg(msg, err)
                     ].filter(v=>v)
        if (0===msgs.length) { return null }
        return `テスト失敗。${1===msgs.length ? '' : '\n'}${msgs.join('\n')}\n`
    }
    static _errMsgType(type, err) { return `エラーの型が違う。\n期待値:${type.name}\n実際値:${err.name}` }
    static _errMsgMsg(msg, err) { return `エラーメッセージが違う。\n期待値:${msg}\n実際値:${err.message}` }
    static _getActual(v) { return this._isFn(v) ? v() : v }
    static _isFn(v) { return 'function'===typeof v }
    static _matchErrorMessage(expected, actual) {
        if (null===expected || undefined===expected) { return true } // 無条件でクリア（メッセージ確認しない）
        if (this._isRegExp(expected)) { return expected.test(actual) }
        else if (this._isString(expected)){ return actual===expected }
        else { return false } // 上記以外の型なら無条件でエラー
    }
    static _isString(v) { return 'string'===typeof v || v instanceof String }
    static _isRegExp(v) { return v instanceof RegExp }
    static _errorStack(msg, caller) {
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, caller ?? this._errorStack);
            console.error(msg + '\n', this.stack)
        } else { console.error(msg) }
    }
}
