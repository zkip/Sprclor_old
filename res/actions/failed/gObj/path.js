class Path extends paper.Path {
    constructor(a, b, c) {
        super(a, b, c);
        let me = this;
        this.autoPivot = false;
        this.vPivot = new Vec(0, 0);
        let _sty;
        this.ev=new MEvent("active", "blur");
        this.activeStyle=new Style();
        this.ev.add("active", () => {
            _sty = me.style.clone();
            me.style.set(me.activeStyle);
        });
        this.ev.add("blur", () => {
            me.style.set(_sty);
        });
    }
    getResetBounds() {
        let bounds = this._getBounds(new paper.Matrix(), {
            handler: false,
            stroke: false,
        });
        return bounds;
    }
}