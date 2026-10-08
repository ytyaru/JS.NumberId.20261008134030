class NumberId {
    static #ALPHABET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_';
    static b16(v) {return new NumberId(16,v);}
    static b32(v) {return new NumberId(32,v);}
    static b36(v) {return new NumberId(36,v);}
    static b64(v) {return new NumberId(64,v);}

    constructor(base = 10, value = 0) {
        this.#validBase(base);
        this._ = { base, value: 0 };
        // コンストラクタで文字列か数値かを自動判定してセット
        this.v = value;
    }

    #validBase(base) {
        if (!Number.isSafeInteger(base) || base < 2 || base > 64) {
            throw new TypeError(`baseは2〜64以内の整数であるべきです。`);
        }
    }

    #validValue(value) {
        if (!Number.isSafeInteger(value) || value < 0) {
            throw new TypeError(`valueは0〜${Number.MAX_SAFE_INTEGER}以内の整数であるべきです。`);
        }
    }

    get base() { 
        return this._.base; 
    }

    get i() { 
        return this._.value; 
    }

    get s() { 
        return this.to(this._.base); 
    }

    set i(v) {
        this.#validValue(v);
        this._.value = v;
    }

    set s(v) {
        if (typeof v !== 'string') {
            throw new TypeError('valueは文字列である必要があります。');
        }
        let val = 0;
        const base = this._.base;

        for (const char of v) {
            const index = NumberId.#ALPHABET.indexOf(char);
            if (index === -1 || index >= base) {
                throw new Error(`文字 "${char}" は基数 ${base} では無効です。`);
            }
            if (val > (Number.MAX_SAFE_INTEGER - index) / base) {
                throw new RangeError('値が安全な整数範囲を超えています。');
            }
            val = val * base + index;
        }
        this._.value = val;
    }

    // 基数に関わらず、別のNumberId、文字列、数値を柔軟にセットできる万能setter
    set v(val) {
        if (val instanceof NumberId) {
            // 別のインスタンスから値（.i）のみを引き継ぐ（自身のbaseは維持）
            this.i = val.i;
        } else if (typeof val === 'string') {
            this.s = val;
        } else {
            this.i = val;
        }
    }

    to(base) {
        this.#validBase(base);
        if (this._.value === 0) return NumberId.#ALPHABET[0];

        let val = this._.value;
        const chars = [];

        while (val > 0) {
            chars.push(NumberId.#ALPHABET[val % base]);
            val = Math.floor(val / base);
        }
        return chars.reverse().join('');
    }

    toBase(base) { 
        return new NumberId(base, this._.value); 
    }

    get inc() { 
        this._.value += 1; 
        return this.i; 
    }

    get dec() { 
        this._.value -= 1; 
        return this.i; 
    }
}
