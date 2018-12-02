class Instance {
    constructor(opt) {
        let me = this;
        this.className = "Instance";
        this.curTools = null;
        let _ = (_, v) => {
            v.setIns(me);
        }
        this.tools = new SelectionEv().on("add-after", _);
        this.ui = new SelectionEv().on("add-after", _);
        this.guides = new SelectionEv().on("add-after", _);
    }
    init() {
        let me = this;
        window.domEv = new DomEv(window);
        me.ui.get("view").init(paper);
        me.ui.get("tree").init();
        me.ui.get("inspector").init();
        me.tools.forEach((_, t) => {
            t._init();
        });
        me.ui.get("toolbar").init();
        me.guides.forEach((_, v) => v._init());
        return this;
    }
}