String.prototype.dates = function(isNotZeroPad=false) { const [dt,P] = [new Date(), isNotZeroPad ? 0 : 2]; return [
    `${dt.getFullYear()}`,
    `${dt.getMonth()+1}`.padStart(P, '0'),
    `${dt.getDate()}`.padStart(P, '0'),
    `${dt.getHours()}`.padStart(P, '0'),
    `${dt.getMinutes()}`.padStart(P, '0'),
    `${dt.getSeconds()}`.padStart(P, '0'),
    `${dt.getMilliseconds()}`.padStart(isNotZeroPad ? 0 : 3, '0'),
] }
String.prototype.timezone = function() {
    const tz = new Date().getTimezoneOffset(); // +09:00 = -540(-540/60=-9)
    const s = tz < 0;
    const h = Math.abs(Math.floor(tz / 60));
    return `${s ? '+' : '-'}` + `${h}`.padStart(2, '0') + ':00'
}
String.prototype.date = function() {return this.formatDatetime(0, 3, false, '- -'.split(' '))}
String.prototype.time = function() {return this.formatDatetime(3, 6, false, ': :'.split(' '))}
String.prototype.datetime = function() {return this.formatDatetime(0, 6, false, '-|-| |:|:|.'.split('|'))}
String.prototype.dateJa = function(isNotZeroPad=false) {return this.formatDatetime(0,3,false,'年 月 日'.split(' '), true, isNotZeroPad)}
String.prototype.timeJa = function(isNotZeroPad=false) {return this.formatDatetime(3,6,false,'時 分 秒'.split(' '), true, isNotZeroPad)}
String.prototype.datetimeJa = function(isNotZeroPad=false) {return this.formatDatetime(0,6,false,'年 月 日 時 分 秒'.split(' '), true, isNotZeroPad)}
String.prototype.iso = function() {return this.formatDatetime(0, 6, true, '- - T : : .'.split(' '))}
String.prototype.timestamp = function(level=6) {
    const ds = this.dates()
    return (0 < level && level <= ds.length)
        ? ds.slice(0,level).join('')
        : ds.join('')
}
String.prototype.formatDatetime = function(start=0, end=6, hasTz=false, ss=null, lastSS=false, isNotZeroPad=false) {
    // 0123456
    // ymdhmsS
    //  --T::.
    // ymd:  0,3
    // hms:  3,6
    const ds = this.dates(isNotZeroPad).slice(start, end);
    const SS = Array.isArray(ss) ? ss : '- - T : : .'.split(' ').slice(start, end);
    return (0<this.length ? `${this}-` : '')
        + ds.reduce((s,v,i)=>s + v + `${i===ds.length-1 ? (lastSS ? SS[i] : '') : SS[i]}`, '')
        + (hasTz ? this.timezone() : '');
}

/*    
String.prototype.iso = function() {
    //const dt = new Date();
    const ds = this.dates()
    const ss = '- - T : : .'.split(' ');
    return [...new Array(level)].reduce((v, i, _)=>v + ds[i] + `${i===level-2 ? '' : ss[i]}`, '')
    for (let i=0; i<level; i++) {
        ds[i]
    }
    return this + `${dt.getFullYear()}-`
        + `${dt.getMonth()+1}`.padStart(2, '0')
        + '-'
        + `${dt.getDate()}`.padStart(2, '0')
        + ' '
        + `${dt.getHours()}`.padStart(2, '0')
        + ':'
        + `${dt.getMinutes()}`.padStart(2, '0')
        + ':'
        + `${dt.getSeconds()}`.padStart(2, '0');
}
*/

