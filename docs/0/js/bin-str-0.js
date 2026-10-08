// --- 1. 変換エンジン (内部コア) ---
class StrBinCodec {
    static bytesToBigInt(bytes) {
        let n = 0n;
        for (const byte of bytes) {
            n = (n << 8n) + BigInt(byte);
        }
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

    static encode(bytes, base, radix) {
        if (bytes.length === 0) return base.chars[0];
        const isPowerOf2 = (radix & (radix - 1)) === 0 && radix >= 2;

        if (isPowerOf2) {
            // MSB-first, Big-Endian, テールパディングフリーのビットシフト処理
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
                    const index = Number((buffer >> BigInt(bits)) & mask);
                    result.push(base.chars[index]);
                }
            }
            if (bits > 0) {
                const index = Number((buffer << BigInt(bitsPerChar - bits)) & mask);
                result.push(base.chars[index]);
            }
            return result.join('');
        } else {
            // 非2のN乗：BigInt除算・剰余ループ
            let val = this.bytesToBigInt(bytes);
            if (val === 0n) return base.chars[0];
            const radixBig = BigInt(radix);
            const result = [];
            while (val > 0n) {
                const rem = Number(val % radixBig);
                result.unshift(base.chars[rem]);
                val /= radixBig;
            }
            return result.join('');
        }
    }

    static decode(str, base, radix) {
        if (str.length === 0) return new Uint8Array(0);
        const isPowerOf2 = (radix & (radix - 1)) === 0 && radix >= 2;
        const charMap = base._.charMap;

        if (isPowerOf2) {
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
        } else {
            let val = 0n;
            const radixBig = BigInt(radix);
            for (const char of str) {
                if (!charMap.has(char)) throw new Error(`未知の文字: ${char}`);
                val = val * radixBig + charMap.get(char);
            }
            return this.bigIntToBytes(val);
        }
    }
}


// --- 2. スキーマ定義・ファクトリー (StrBin) ---
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
        if (radix === undefined) { radix = this._.radix; }
        if (this._.radix < radix) {
            throw new RangeError(`radix範囲超過: ${radix} (最大: ${this._.radix})`);
        }
        return new StrBinIns(this, radix, value, isMutable);
    }

    from(value, radix = undefined) {
        return this.gen(value, radix, true);
    }
}


// --- 3. インスタンス・API層 (StrBinIns) ---
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
    set i(val) {
        this._checkMutable();
        this.setValue(val);
    }

    get s() { return this._.s; }
    set s(val) {
        this._checkMutable();
        this.setValue(val);
    }

    get b() { return this._.b; }
    set b(val) {
        this._checkMutable();
        this.setValue(val);
    }

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

    to(targetStrBin, targetRadix = undefined) {
        if (!(targetStrBin instanceof StrBin)) {
            throw new TypeError('変換先は StrBin インスタンスである必要があります。');
        }
        return targetStrBin.gen(this._.b, targetRadix, this._.isMutable);
    }

    toRadix(radix) {
        return this._.base.gen(this._.b, radix, this._.isMutable);
    }
}


// --- 4. 拡張クラス群 (Fix / Var) ---

// 固定 (Fix) の外部標準ID
const GLOBAL_ID_ENGINE = new StrBin('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_');
class GlobalId extends StrBinIns {
    constructor(value = 0) {
        super(GLOBAL_ID_ENGINE, 64, value, false); // isMutable = false
    }
}

// 変動 (Var) のカスタム進数
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
