// --- 1. 独立した変換戦略 (SRP 徹底) ---

// 標準 Base64 戦略 (+ / とパディング処理)
class StandardBase64Strategy {
    static ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

    static encode(bytes) {
        const binStr = StrBinCodec._bytesToBinaryString(bytes);
        return btoa(binStr).replace(/=+$/, ''); // テールパディングフリー
    }

    static decode(str) {
        let b64 = str;
        while (b64.length % 4 !== 0) b64 += '=';
        try {
            return StrBinCodec._binaryStringToBytes(atob(b64));
        } catch (e) {
            throw new Error('不正な標準 Base64 文字列です。');
        }
    }
}

// Base64URL 戦略 (- / _)
class Base64UrlStrategy {
    static ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';

    static encode(bytes) {
        const binStr = StrBinCodec._bytesToBinaryString(bytes);
        return btoa(binStr).replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_');
    }

    static decode(str) {
        let b64 = str.replace(/-/g, '+').replace(/_/g, '/');
        while (b64.length % 4 !== 0) b64 += '=';
        try {
            return StrBinCodec._binaryStringToBytes(atob(b64));
        } catch (e) {
            throw new Error('不正な Base64URL 文字列です。');
        }
    }
}

// 2のN乗基数・ビットシフト戦略 (Base32, Base16, 2進数など)
class PowerOf2Strategy {
    static encode(bytes, radix, chars) {
        if (bytes.length === 0) return chars[0];
        const bitsPerChar = Math.log2(radix);
        let buffer = 0n;
        let bits = 0;
        const result = [];
        const mask = BigInt(radix - 1);

        for (const byte of bytes) {
            buffer = (buffer << 8n) + BigInt(byte);
            bits += 8;
            while (bits >= bitsPerChar) {
                bits -= bitsPerChar;
                result.push(chars[Number((buffer >> BigInt(bits)) & mask)]);
            }
        }
        if (bits > 0) {
            result.push(chars[Number((buffer << BigInt(bitsPerChar - bits)) & mask)]);
        }
        return result.join('');
    }

    static decode(str, radix, charMap) {
        if (str.length === 0) return new Uint8Array(0);
        const bitsPerChar = Math.log2(radix);
        let buffer = 0n;
        let bits = 0;
        const bytes = [];

        for (const char of str) {
            if (!charMap.has(char)) throw new Error(`未知の文字: ${char}`);
            buffer = (buffer << BigInt(bitsPerChar)) | charMap.get(char);
            bits += bitsPerChar;
            while (bits >= 8) {
                bits -= 8;
                bytes.push(Number((buffer >> Bits) & 0xffn)); // 修正: buffer >> BigInt(bits)
            }
        }
        // 上記のビットデコードの正確なループ処理
        return PowerOf2Strategy._decodeInternal(str, radix, charMap);
    }

    static _decodeInternal(str, radix, charMap) {
        const bitsPerChar = Math.log2(radix);
        let buffer = 0n;
        let bits = 0;
        const bytes = [];

        for (const char of str) {
            if (!charMap.has(char)) throw new Error(`未知の文字: ${char}`);
            buffer = (buffer << BigInt(bitsPerChar)) | charMap.get(char);
            bits += bitsPerChar;
            while (bits >= 8) {
                bits -= 8;
                bytes.push(Number((buffer >> BigInt(bits)) & 0xffn));
            }
        }
        return new Uint8Array(bytes);
    }
}

// ネイティブ基数変換戦略 (2〜36)
class NativeRadixStrategy {
    static STANDARD_CHARS = '0123456789abcdefghijklmnopqrstuvwxyz';

    static isSupported(radix, chars) {
        return radix >= 2 && radix <= 36 && chars.toLowerCase() === this.STANDARD_CHARS.slice(0, radix);
    }

    static encode(bytes, radix, chars) {
        const val = StrBinCodec.bytesToBigInt(bytes);
        const str = val.toString(radix);
        return chars === this.STANDARD_CHARS.slice(0, radix).toUpperCase() ? str.toUpperCase() : str;
    }
}

// 非2のN乗基数・BigInt除算戦略
class ArbitraryRadixStrategy {
    static encode(bytes, radix, chars) {
        let val = StrBinCodec.bytesToBigInt(bytes);
        if (val === 0n) return chars[0];
        const radixBig = BigInt(radix);
        const result = [];
        while (val > 0n) {
            result.unshift(chars[Number(val % radixBig)]);
            val /= radixBig;
        }
        return result.join('');
    }

    static decode(str, radix, charMap) {
        if (str.length === 0) return new Uint8Array(0);
        let val = 0n;
        const radixBig = BigInt(radix);
        for (const char of str) {
            if (!charMap.has(char)) throw new Error(`未知の文字: ${char}`);
            val = val * radixBig + charMap.get(char);
        }
        return StrBinCodec.bigIntToBytes(val);
    }
}


// --- 2. コーデック・ディスパッチャ ---
class StrBinCodec {
    static bytesToBigInt(bytes) {
        let n = 0n;
        for (const byte of bytes) n = (n << 8n) + BigInt(byte);
        return n;
    }

    static bigIntToBytes(n) {
        if (n === 0n) return new Uint8Array(0);
        const bytes = [];
        while (n > 0n) {
            bytes.unshift(Number(n & 0xffn));
            n >>= 8n;
        }
        return new Uint8Array(bytes);
    }

    static _bytesToBinaryString(bytes) {
        const CHUNK_SIZE = 0x8000;
        let result = '';
        for (let i = 0; i < bytes.length; i += CHUNK_SIZE) {
            result += String.fromCharCode.apply(null, bytes.subarray(i, i + CHUNK_SIZE));
        }
        return result;
    }

    static _binaryStringToBytes(str) {
        const bytes = new Uint8Array(str.length);
        for (let i = 0; i < str.length; i++) bytes[i] = str.charCodeAt(i);
        return bytes;
    }

    static encode(bytes, base, radix) {
        if (bytes.length === 0) return base.chars[0];

        if (radix === 64) {
            if (base.chars === StandardBase64Strategy.ALPHABET) return StandardBase64Strategy.encode(bytes);
            if (base.chars === Base64UrlStrategy.ALPHABET) return Base64UrlStrategy.encode(bytes);
        }
        if (NativeRadixStrategy.isSupported(radix, base.chars)) {
            return NativeRadixStrategy.encode(bytes, radix, base.chars);
        }
        const isPowerOf2 = (radix & (radix - 1)) === 0 && radix >= 2;
        if (isPowerOf2) {
            return PowerOf2Strategy.encode(bytes, radix, base.chars);
        }
        return ArbitraryRadixStrategy.encode(bytes, radix, base.chars);
    }

    static decode(str, base, radix) {
        if (str.length === 0) return new Uint8Array(0);

        if (radix === 64) {
            if (base.chars === StandardBase64Strategy.ALPHABET) return StandardBase64Strategy.decode(str);
            if (base.chars === Base64UrlStrategy.ALPHABET) return Base64UrlStrategy.decode(str);
        }
        const isPowerOf2 = (radix & (radix - 1)) === 0 && radix >= 2;
        if (isPowerOf2) {
            return PowerOf2Strategy._decodeInternal(str, radix, base._.charMap);
        }
        return ArbitraryRadixStrategy.decode(str, radix, base._.charMap);
    }
}


// --- 3. スキーマ定義・ファクトリー (StrBin) ---
class StrBin {
    constructor(chars) {
        if (typeof chars !== 'string' || chars.length === 0) {
            throw new TypeError('文字セットが必要です。');
        }
        const unique = Array.from(new Set(chars));
        if (unique.length !== chars.length) {
            throw new Error('重複する文字が含まれています。');
        }
        this._ = {
            chars: chars,
            radix: chars.length,
            charMap: new Map(chars.split('').map((c, i) => [c, BigInt(i)]))
        };
    }

    get chars() { return this._.chars; }
    get radix() { return this._.radix; }

    gen(value = 0, radix = undefined, isMutable = true) {
        if (radix === undefined) radix = this._.radix;
        if (this._.radix < radix) {
            throw new RangeError(`radix範囲超過: ${radix} (最大: ${this._.radix})`);
        }
        return new StrBinIns(this, radix, value, isMutable);
    }

    from(value, radix = undefined) {
        return this.gen(value, radix, true);
    }
}


// --- 4. インスタンス・API層 (StrBinIns) ＆ 相互変換ハブ ---
class StrBinIns {
    constructor(base, radix, value, isMutable = true) {
        this._ = {
            base: base,
            radix: radix,
            isMutable: isMutable,
            i: 0n,
            b: new Uint8Array(0),
            s: ''
        };
        this.setValue(value);
    }

    get i() { return this._.i; }
    set i(val) { this._checkMutable(); this.setValue(val); }

    get s() { return this._.s; }
    set s(val) { this._checkMutable(); this.setValue(val); }

    get b() { return this._.b; }
    set b(val) { this._checkMutable(); this.setValue(val); }

    _checkMutable() {
        if (!this._.isMutable) {
            throw new TypeError('このインスタンスは不変 (Fix) です。値を変更することはできません。');
        }
    }

    setValue(val) {
        if (typeof val === 'string') {
            this._.s = val;
            this._.b = StrBinCodec.decode(val, this._.base, this._.radix);
            this._.i = StrBinCodec.bytesToBigInt(this._.b);
        } else if (val instanceof Uint8Array) {
            this._.b = val;
            this._.i = StrBinCodec.bytesToBigInt(val);
            this._.s = StrBinCodec.encode(val, this._.base, this._.radix);
        } else if (typeof val === 'bigint' || typeof val === 'number') {
            const bigVal = BigInt(val);
            if (bigVal < 0n) throw new RangeError('負の値はサポートされていません。');
            this._.i = bigVal;
            this._.b = StrBinCodec.bigIntToBytes(bigVal);
            this._.s = StrBinCodec.encode(this._.b, this._.base, this._.radix);
        } else {
            throw new TypeError('サポートされていない初期値の型です。');
        }
        return this;
    }

    inc(delta = 1n) {
        this._checkMutable();
        this.setValue(this._.i + BigInt(delta));
        return this;
    }

    dec(delta = 1n) {
        this._checkMutable();
        const next = this._.i - BigInt(delta);
        if (next < 0n) throw new RangeError('値が負になります。');
        this.setValue(next);
        return this;
    }

    // 相互変換ハブメソッド
    to(targetStrBin, targetRadix = undefined) {
        if (!(targetStrBin instanceof StrBin)) {
            throw new TypeError('変換先は StrBin インスタンスである必要があります。');
        }
        return targetStrBin.gen(this._.b, targetRadix, this._.isMutable);
    }

    toRadix(radix) {
        return this._.base.gen(this._.b, radix, this._.isMutable);
    }

    // よく使う形式へのショートカット相互変換 API
    toBase64() {
        return BASE64_ENGINE.gen(this._.b, 64, this._.isMutable);
    }

    toBase64Url() {
        return BASE64URL_ENGINE.gen(this._.b, 64, this._.isMutable);
    }

    toBase32() {
        return BASE32_ENGINE.gen(this._.b, 32, this._.isMutable);
    }
}


// --- 5. 標準エンジン・ラッパー定義 ---

// 1. 標準 Base64エンジン & クラス
const BASE64_ENGINE = new StrBin(StandardBase64Strategy.ALPHABET);
class Base64Id extends StrBinIns {
    constructor(value = 0) { super(BASE64_ENGINE, 64, value, false); }
}

// 2. Base64URL (GlobalId) エンジン & クラス
const BASE64URL_ENGINE = new StrBin(Base64UrlStrategy.ALPHABET);
class GlobalId extends StrBinIns {
    constructor(value = 0) { super(BASE64URL_ENGINE, 64, value, false); }
}

// 3. Base32 (RFC 4648) エンジン & クラス
const BASE32_ENGINE = new StrBin('ABCDEFGHIJKLMNOPQRSTUVWXYZ234567');
class Base32Id extends StrBinIns {
    constructor(value = 0) { super(BASE32_ENGINE, 32, value, false); }
}

// 4. カスタム進数 (Radix 2〜64, Var / 可変)
const CUSTOM_RADIX_ENGINE = new StrBin('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_');

class RadixNumber extends StrBinIns {
    constructor(value = 0, radix = 64) {
        if (typeof value === 'number' && value > Number.MAX_SAFE_INTEGER) {
            throw new RangeError('RadixNumber は MAX_SAFE_INTEGER を超える値を扱えません。');
        }
        super(CUSTOM_RADIX_ENGINE, radix, value, true);
    }

    get i() {
        const bigVal = super.i;
        if (bigVal > BigInt(Number.MAX_SAFE_INTEGER)) {
            throw new RangeError('保持している値が Number の安全な範囲を超えています。');
        }
        return Number(bigVal);
    }
    set i(val) {
        if (typeof val === 'number' && val > Number.MAX_SAFE_INTEGER) {
            throw new RangeError('MAX_SAFE_INTEGER を超える数値です。');
        }
        super.i = val;
    }
}

class RadixBigInt extends StrBinIns {
    constructor(value = 0n, radix = 64) {
        super(CUSTOM_RADIX_ENGINE, radix, BigInt(value), true);
    }
}
