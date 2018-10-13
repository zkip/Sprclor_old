class View extends Base {
    constructor(type, d) {
        super();
        if (d instanceof HTMLElement) {
            this.dom = d;
        } else if (typeof d === "string") {
            this.dom = document.createElement(d);
        }
        this.__idx_id = {}; // ID : View
        this.__idx_type = new Map(); // Type : M{ ID:View }
        this.__parent = null;
        this.type = type;
        this.__isViewed = false;
        this.dom.classList.add(this.type);
    }
    // View
    addTo(v) {
        v.__idx_type[this.type] = this;
        v.__idx_id[this.ID] = this;
        v.dom.appendChild(this.dom);
        this.parent = v;
        this.__isViewed = true;
        return this;
    }
    // View
    rm(v) {
        let {
            ID,
            type,
        } = v;
        this.__isViewed = false;
        delete this.__idx_id[ID];
        delete this.__idx_type[type];
    }
    isViewed() {
        return this.__isViewed;
    }
    addListener(et, fn) {
        this.dom.addEventListener(et, fn);
    }
    rmListener(et, fn) {
        this.dom.removeEventListener(et, fn);
    }
    parent() {
        return this.__parent;
    }
    children(opt) {
        if (!opt) {
            return this.__idx_id;
        }
        let {
            type,
            id
        } = opt;
        if (type) {
            return this.__idx_type(type);
        } else if (id) {
            return this.__idx_id(id);
        }
        return null;
    }
    class() {
        return this.dom.classList;
    }
}

class Layout extends View {
    constructor(d) {
        super("Layout", d || "div");
    }
    // "v"/"h":
    dir(dir) {
        if (dir === "v") {
            this.dom.classList.remove("h");
            this.dom.classList.add(dir);
        } else if (dir === "h") {
            this.dom.classList.remove("v");
            this.dom.classList.add(dir)
        }
        return this;
    }
}

class Root extends View {
    constructor(d) {
        super("Root", d);
    }
    addListener(et, fn) {
        addEventListener(et, fn);
    }
    rmListener(et, fn) {
        removeEventListener(et, fn);
    }
}
View.Root = Root;

class Toolbar extends View {
    constructor() {
        super("Toolbar", "div");
        this.tools = {}; // group_name: { name: tool }
        this.gDoms = {}; // group_name: .group_name HTMLDivElement
    }
    setTools(toolOs) {
        for (let gN in toolOs) {
            let tool = toolOs[gN];
            if (!this.tools[gN]) {
                this.tools[gN] = {};
                let s = document.createElement("div");
                s.classList.add(gN);
                this.gDoms[gN] = s;
            }
            this.tools[gN][tool.type] = tool;
            let d = document.createElement("div");
            d.classList.add(tool.type);
            this.gDoms[gN].appendChild(d);
        }
    }
}
View.Toolbar = Toolbar;

class Workspace extends View {
    constructor(paper) {
        super("Workspace", "canvas");
    }
    init(fn) {
        fn(this.dom);
        return this;
    }
}
View.Workspace = Workspace;

class Inspector extends View {
    constructor() {
        super("Inspector", "div");
    }
}
View.Inspector = Inspector;

class Framework extends View {
    constructor(host) {
        super("Framework", host);
        this.other = new Map();
        new Layout(this.dom).dir("h");
        this.toolbar = new Toolbar().addTo(this);
        let main = new Layout().addTo(this).dir("v");
        main.class().add("main");
        this.workspace = new Workspace().addTo(main);
        this.inspector = new Inspector().addTo(main);
    }
}