class Instance {
    constructor(opt) {
        let me = this;
        this.className = "Instance";
        this.curTools = null;
        this.tools = new SelectionEv().on("add-after", (_, t) => {
            t.setIns(me);
        });
        this.ui = new SelectionEv().on("add-after", (_, ui) => {
            ui.setIns(me);
        });
    }
    init() {
        let me = this;
        window.domEv=new DomEv(window);
        me.ui.get("view").init(paper);
        me.ui.get("tree").init();
        me.ui.get("inspector").init();
        me.tools.forEach((_, t) => {
            t.init();
        });
        me.ui.get("toolbar").init();
        return this;
    }
}