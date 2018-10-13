package("sprclor", function() {
    class Path extends this.Base {
        constructor() {}
    }
    class Tool extends this.Base {
        constructor() {}
    }
    class Renderer extends this.Base {
        constructor() {}
    }
    class Camera extends this.Base {
        constructor() {}
    }
    // 用户界面视图
    class View extends this.Base {
        constructor(name) {
            super("View");
            assign({
                name: name,
                parent: null,
                children: new Map
            });
        }
        // 插入文档
        add() {}
        // 从文档移除
        rm() {}
    }
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
    return class extends this.Base {
        constructor() {
            assign(this, {
                Path: Path,
                Tool: Tool,
                Renderer: Renderer,
                Camera: Camera,
                View: View,
                Ins: Inspector,
            });
        }
        run() {
            // 
        }
    }
})