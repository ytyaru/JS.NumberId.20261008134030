class Base64Url {
    // 通常のBase64用正規表現 (A-Z, a-z, 0-9, +, /, パディングの =)
    static #REGEX_STANDARD_64 = /^[A-Za-z0-9\+\/]+={0,2}$/;
    // Base64URL用正規表現 (A-Z, a-z, 0-9, -, _, パディングの =)
    static #REGEX_URL_64 = /^[A-Za-z0-9\-_]+={0,2}$/;

    /**
     * Base64URL文字列を通常のBase64文字列に変換する
     * @param {string} s Base64URL形式の文字列
     */
    static to64(s) {
        if (typeof s !== 'string') {
            throw new TypeError('入力は文字列である必要があります。');
        }
        if (!Base64Url.#REGEX_URL_64.test(s)) {
            throw new TypeError('無効なBase64URL文字列です（許可されていない文字が含まれています）。');
        }
        if (s.length % 4 === 1) {
            throw new RangeError('文字列の長さが不正です。');
        }

        // -, _ を +, / に置換し、不足しているパディング(=)を補完する
        let standard = s.replace(/-/g, '+').replace(/_/g, '/');
        while (standard.length % 4 !== 0) {
            standard += '=';
        }
        return standard;
    }

    /**
     * 通常のBase64文字列をBase64URL文字列に変換する
     * @param {string} s 通常のBase64形式の文字列
     */
    static from64(s) {
        if (typeof s !== 'string') {
            throw new TypeError('入力は文字列である必要があります。');
        }
        if (!Base64Url.#REGEX_STANDARD_64.test(s)) {
            throw new TypeError('無効な通常のBase64文字列です（Base64URLに変換できない文字が含まれています）。');
        }
        if (s.length % 4 === 1) {
            throw new RangeError('文字列の長さが不正です。');
        }

        // +, / を -, _ に置換し、URLセーフのためにパディング(=)を削除する
        return s.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    }

    /**
     * Uint8Array を Base64URL文字列に変換する（URLセーフ標準：パディングなし）
     * @param {Uint8Array} b バイト配列
     */
    static fromUint8Array(b) {
        if (!(b instanceof Uint8Array)) {
            throw new TypeError('入力は Uint8Array である必要があります。');
        }

        let binary = '';
        const CHUNK_SIZE = 0x8000;
        for (let i = 0; i < b.length; i += CHUNK_SIZE) {
            const chunk = b.subarray(i, i + CHUNK_SIZE);
            binary += String.fromCharCode.apply(null, chunk);
        }

        // btoaで標準Base64を作った後、from64でBase64URLに変換
        return Base64Url.from64(btoa(binary));
    }

    /**
     * Base64URL文字列を Uint8Array に変換する
     * @param {string} s Base64URL文字列
     */
    static toUint8Array(s) {
        // まず通常のBase64形式（+, / およびパディング付き）に安全に変換
        const standardBase64 = Base64Url.to64(s);

        try {
            const binary = atob(standardBase64);
            const bytes = new Uint8Array(binary.length);
            for (let i = 0; i < binary.length; i++) {
                bytes[i] = binary.charCodeAt(i);
            }
            return bytes;
        } catch (e) {
            throw new Error(`Base64のデコードに失敗しました: ${e.message}`);
        }
    }

    /**
     * BigInt を Base64URL文字列に変換する
     * @param {bigint} i 整数値
     */
    static fromBigInt(i) {
        if (typeof i !== 'bigint') {
            throw new TypeError('入力は BigInt である必要があります。');
        }
        if (i < 0n) {
            throw new RangeError('負の数はサポートされていません。');
        }
        if (i === 0n) {
            return 'A';
        }

        let val = i;
        const bytes = [];
        while (val > 0n) {
            bytes.unshift(Number(val & 0xffn));
            val >>= 8n;
        }
        return Base64Url.fromUint8Array(new Uint8Array(bytes));
    }

    /**
     * Base64URL文字列を BigInt に変換する
     * @param {string} s Base64URL文字列
     */
    static toGlobalBigInt(s) {
        const bytes = Base64Url.toUint8Array(s);
        let val = 0n;
        for (const byte of bytes) {
            val = (val << 8n) + BigInt(byte);
        }
        return val;
    }
}
