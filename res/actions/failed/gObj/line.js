class Line extends paper.Path.Line {
    // constructor(a, b, c, d) {
    //     super(a, b, c, d);
    //     let _sty;
    //     this.ev = new MEvent("active", "blur");
    //     this.activeStyle = new Style();
    //     this.ev.add("active", () => {
    //         _sty = me.style.clone();
    //         me.style.set(me.activeStyle);
    //     });
    //     this.ev.add("blur", () => {
    //         me.style.set(_sty);
    //     });
    // }
}
Path.Line = Line;