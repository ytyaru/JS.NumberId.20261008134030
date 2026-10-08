function getResizedObserver(fn, delay) {
    // 最後の一回だけ実行する https://www.webdesignleaves.com/pr/jquery/resizeObserver.html#h4_index_26
    const debounce = (func, delay=300) => { // 最後に呼び出されてからdelayミリ秒後に一回だけ実行する
        let timer = null
        return (...args) => {
            clearTimeout(timer)
            timer = setTimeout(() => func.apply(null, args), delay);
        }
    }
    return new ResizeObserver(debounce((entries) => {
        for (let entry of entries) { fn(entry) }
    }, delay));
}
