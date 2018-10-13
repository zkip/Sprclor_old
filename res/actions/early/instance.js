class Instance extends Base {
    constructor() {
        this.view = new
    }
}

class Selection extends Base {
    constructor() {
        // 
    }
    // obj,...str
    add(v, ...tags) {}
    // str
    rm(tag) {}
    // str:obj
    get(...tags) {}
    // str:obj
    getFirst(...tags) {}
}