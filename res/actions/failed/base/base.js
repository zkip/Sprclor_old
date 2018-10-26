class Inster {
    constructor(name) {
        this.name = name;
        this._ins = null;
    }
    setIns(ins) {
        this._ins = ins;
        return this;
    }
    getIns() {
        return this._ins;
    }
    init() {}
}
class UI extends Inster {
    constructor(name, d) {
        super(name);
        this.dom = d;
    }
}
class Tool extends Inster {
    constructor(name) {
        super(name);
        this.mEvent = new MEvent("on", "off");
    }
}