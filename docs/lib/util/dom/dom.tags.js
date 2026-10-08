(function(){
const tag = (ns, name, ...args) => {
    const [{is, ...props}, ...children] = 0<args.length && 'object'===typeof args[0] && '[object Object]'===Object.prototype.toString.call(args[0]) ? args : [{}, ...args];
    const dom = ns ? document.createElementNS(ns, name, {is}) : document.createElement(name, {is})
    for (let [k, v] of Object.entries(props)) {
        if ('listeners'===k) {props.listeners.map(l=>dom.listen(...l))}
        else {dom.setAttribute(k, v);}
    }
    dom.append(...children.map(c=>c));
    return dom;
}
const handler = ns => ({get: (_, name) => tag.bind(undefined, ns, name)})
window.Dom = {tags: new Proxy(ns => new Proxy(tag, handler(ns)), handler()),
    q:(...args)=>document.querySelector(...args),
    qs:(...args)=>document.querySelectorAll(...args),
    qa:(...args)=>[...document.querySelectorAll(...args)],
};
})();
