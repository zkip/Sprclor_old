class ToolBar extends View {
    constructor() {
        super("ToolBar");
        assign({
            cur: 0, // 当前工具
            tools: new Map,
            len: 0,
        })
    }
    // 设置工具
    setTools(...ts) {
        for (let i = 0; i < ts.length; i++) {
            let t = ts[i];
            if (typeof t === Tool) {
                this.tools.set(t.ID, t);
            }
        }
        return this;
    }
    // 选择工具
    select(order) {
        if (order > 0 && order < this.len) {
            this.cur = order;
        }
    }
}

class ToolOption extends View {
    constructor() {
        super("ToolOption");
    }
    setOption() {
        // 
    }
}
class Inspector extends View {
    constructor() {
        super("Inspector");
    }
    setProperies() {}
}