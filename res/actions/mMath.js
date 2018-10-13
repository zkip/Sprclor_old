function m_add(...nstr) {
    return sum(...(nstr.map(x => x * 1))) + '';
}

function sum(...ns) {
    let s = 0;
    for (let i = 0; i < ns.length; i++) {
        s += ns[i];
    }
    return s;
}