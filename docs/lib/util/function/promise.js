Function.prototype.toPromise = function(...args) {
    return new Promise((resolve, reject)=>{
        try { resolve(this(...args)) }
        catch (e) { reject(e) }
    })
}
Object.defineProperty(Function.prototype, 'type', { get() {return this.constructor} })
Object.defineProperty(Function.prototype, 'typeName', { get() {return this.constructor.name} })
const GeneratorFunction = function* () {}.constructor;
const AsyncFunction = async function () {}.constructor;
const AsyncGeneratorFunction = async function* () {}.constructor;
GeneratorFunction.prototype.toPromise = function*(...args) { // 実際に生成されたジェネレータ関数に継承されない……
    for (let item of this(...args)) {
        yield new Promise((resolve, reject)=>{
            try { resolve(item) }
            catch (e) { reject(e) }
        })
    }
}
//AsyncFunction.prototype.toPromise = function(...args) { return this }
//AsyncGeneratorFunction.prototype.toPromise = function*(...args) { return this }
//    if ('AsyncFunction'===this.constructor.name) { return this }
//Function.prototype.toPromiseGen = function*(...args) {
//    if ('AsyncGeneratorFunction'===this.constructor.name) { return this }
//    if ('GeneratorFunction'===this.constructor.name) {

