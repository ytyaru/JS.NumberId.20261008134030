class GlobalId {
    static #ALPHABET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_';

    static gen(bit = 256) {
        return new GlobalId(bit);
    }

    constructor(bit = 256, value) {
        this.#validBit(bit);
        this._ = {
            bit,
            i: value === undefined ? this.#generateRandom(bit) : this.#parseValue(value, bit),
            s: null,
            b: null
        };
    }

    #validBit(bit) {
        if (!Number.isSafeInteger(bit) || bit <= 0 || bit % 8 !== 0) {
            throw new TypeError('bitは8の倍数の正の整数（例: 128, 256, 512）であるべきです。');
        }
    }

    #generateRandom(bit) {
        const byteLength = bit / 8;
        const bytes = new Uint8Array(byteLength);
        crypto.getRandomValues(bytes);

        let val = 0n;
        for (const byte of bytes) {
            val = (val << 8n) + BigInt(byte);
        }
        return val;
    }

    #parseValue(value, bit) {
        let val = 0n;

        if (typeof value === 'bigint') {
            val = value;
        } else if (typeof value === 'number') {
            if (!Number.isSafeInteger(value) || value < 0) {
                throw new TypeError('無効な数値です。');
            }
            val = BigInt(value);
        } else if (typeof value === 'string') {
            for (const char of value) {
                const index = GlobalId.#ALPHABET.indexOf(char);
                if (index === -1) {
                    throw new Error(`無効な文字 "${char}" がBase64文字列に含まれています。`);
                }
                val = (val * 64n) + BigInt(index);
            }
        } else if (value instanceof Uint8Array) {
            for (const byte of value) {
                val = (val << 8n) + BigInt(byte);
            }
        } else {
            throw new TypeError('サポートされていない値の型です（BigInt, String, Uint8Arrayのいずれかが必要です）。');
        }

        const maxVal = (1n << BigInt(bit)) - 1n;
        if (val < 0n || val > maxVal) {
            throw new RangeError(`値が指定されたbit数 (${bit}bit) の範囲外です。`);
        }
        return val;
    }

    get bit() {
        return this._.bit;
    }

    // BigInt型
    get i() {
        return this._.i;
    }

    // Base64文字列型（遅延初期化 ＋ キャッシュ）
    get s() {
        if (this._.s === null) {
            if (this._.i === 0n) {
                const charLen = Math.ceil(this._.bit / 6);
                this._.s = GlobalId.#ALPHABET[0].repeat(charLen);
            } else {
                let val = this._.i;
                const chars = [];
                while (val > 0n) {
                    chars.push(GlobalId.#ALPHABET[Number(val % 64n)]);
                    val /= 64n;
                }
                const charLen = Math.ceil(this._.bit / 6);
                while (chars.length < charLen) {
                    chars.push(GlobalId.#ALPHABET[0]);
                }
                this._.s = chars.reverse().join('');
            }
        }
        return this._.s;
    }

    // Uint8Array型（バイト配列）（遅延初期化 ＋ キャッシュ）
    get b() {
        if (this._.b === null) {
            const byteLength = this._.bit / 8;
            const arr = new Uint8Array(byteLength);
            let val = this._.i;
            for (let i = byteLength - 1; i >= 0; i--) {
                arr[i] = Number(val & 0xffn);
                val >>= 8n;
            }
            this._.b = arr;
        }
        return this._.b;
    }
}
