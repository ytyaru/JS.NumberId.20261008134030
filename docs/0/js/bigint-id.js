class BigIntId {
    static #ALPHABET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_';

    static b16(v) { return new BigIntId(16, v); }
    static b32(v) { return new BigIntId(32, v); }
    static b36(v) { return new BigIntId(36, v); }
    static b64(v) { return new BigIntId(64, v); }

    constructor(base = 10, value = 0n) {
        this.#validBase(base);
        this._ = { base, value: 0n };
        this.v = value;
    }

    #validBase(base) {
        if (!Number.isSafeInteger(base) || base < 2 || base > 64) {
            throw new TypeError(`baseは2〜64以内の整数であるべきです。`);
        }
    }

    #validValue(value) {
        try {
            const val = BigInt(value);
            if (val < 0n) throw new Error();
            return val;
        } catch {
            throw new TypeError(`valueは0以上の有効な整数であるべきです。`);
        }
    }

    get base() { 
        return this._.base; 
    }

    get i() { 
        return this._.value; 
    }

    set i(v) {
        this._.value = this.#validValue(v);
    }

    get s() { 
        return this.to(this._.base); 
    }

    set s(v) {
        if (typeof v !== 'string') {
            throw new TypeError('valueは文字列である必要があります。');
        }
        let val = 0n;
        const base = BigInt(this._.base);

        for (const char of v) {
            const index = BigIntId.#ALPHABET.indexOf(char);
            if (index === -1 || index >= base) {
                throw new Error(`文字 "${char}" は基数 ${this._.base} では無効です。`);
            }
            val = val * base + BigInt(index);
        }
        this._.value = val;
    }

    // 別インスタンス、文字列、数値/BigIntを柔軟に受け取るsetter
    set v(val) {
        if (val instanceof BigIntId) {
            this._.value = val.i;
        } else if (typeof val === 'string') {
            this.s = val;
        } else {
            this._.value = this.#validValue(val);
        }
    }

    to(base) {
        this.#validBase(base);
        if (this._.value === 0n) return BigIntId.#ALPHABET[0];

        let val = this._.value;
        const b = BigInt(base);
        const chars = [];

        while (val > 0n) {
            chars.push(BigIntId.#ALPHABET[Number(val % b)]);
            val /= b;
        }
        return chars.reverse().join('');
    }

    toBase(base) { 
        return new BigIntId(base, this._.value); 
    }

    get inc() { 
        this._.value += 1n; 
        return this.i; 
    }

    get dec() { 
        this._.value -= 1n; 
        return this.i; 
    }
}
