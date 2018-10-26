{
    class Toolbar extends UI {
        constructor(d) {
            super("Toolbar", d);
            this.mEvent = new MEvent("tool-change");
            this.mEvent.add("tool-change", (l, n) => {
                l && l.mEvent.execute("off");
                n && n.mEvent.execute("on");
            })
            let l = new Loki();
            this.group = l.addCollection("group");
            this.children = l.addCollection("children");
            this._lastRet = null;
        }
        init() {
            let me = this;
            let _add = (t) => {
                let v = Toolbar.icoM[t.name];
                let GID, cls;
                if (v.constructor === Array && v.length > 1) {
                    cls = v[0];
                    GID = v[1];
                } else {
                    GID = 0;
                    cls = v;
                }
                this.add(t, GID, cls);
            }
            this._ins.tools.forEach((_, t) => {
                _add(t)
            });
            this._ins.tools.on("add-after", (_, t) => {
                _add(t);
            }).on("rm-after", (_, t) => {
                me.rm(t);
            });
            me.dom.addEventListener("mousedown", (e) => {
                let opt = {};
                if (e.path.length === 6) {
                    opt.groupDom = {
                        "$eq": e.path[0]
                    };
                } else if (e.path.length === 8) {
                    opt.dom = {
                        "$eq": e.path[0]
                    };
                }
                me.select(opt);
            });
            // me.dom.addEventListener("mousemove", (e) => {
            //     if (e.path.length > 5) {
            //         let item = e.path[0];
            //         if (last !== item && item !== d) {
            //             let bounds = item.getBoundingClientRect();
            //             d.style.left = bounds.left + "px";
            //             d.style.top = bounds.bottom + "px";
            //             last = item;
            //         }
            //         d.style.visibility = "visible";
            //     }
            // });
            // // console.log(this.children);
            // me.dom.addEventListener("mouseout", (e) => {
            //     d.style.visibility = "hidden";
            // })
            this.select({
                name: "Picker",
            });
            this.select({
                name: "Rect",
            });
            this.select({
                name: "Picker",
            });
        }
        // Tool,uint,str : this
        add(t, GID, cls) {
            let d = document.createElement("div");
            d.classList.add(t.name);
            GID = GID || Symbol();
            let ret = this.group.find({
                GID: GID
            });
            let g;
            let wrap;
            if (ret.length === 0) {
                g = document.createElement("div");
                wrap = document.createElement("div");
                wrap.classList.add("wrap");
                g.classList.add("single");
                g.appendChild(wrap);
                this.dom.appendChild(g);
                this.group.insert({
                    GID: GID,
                    groupDom: g,
                    curDom: d,
                });

            } else {
                g = ret[0].groupDom;
                wrap = g.children[0];
                // console.log(wrap.children);
            }
            wrap.appendChild(d);
            if (!isUndefined(cls)) {
                d.classList.add(cls);
            }

            if (wrap.children.length === 1) {
                if (!isUndefined(cls)) {
                    g.classList.add(cls);
                }
            }
            if (wrap.children.length > 1) {
                g.classList.remove("single");
            }

            this.children.insert({
                GID: GID,
                tool: t,
                dom: d,
                name: t.name,
                cls: cls,
                groupDom: g,
            });
        }
        select(opt) {
            let me = this;
            let ret = this.children.find(opt);
            let v = ret[0];
            if (me._lastRet && me._lastRet.tool === v.tool) return;
            let _ret = me.group.chain().find({
                GID: v.GID,
            });
            let tool = me.children.find({
                dom: {
                    "$eq": (me._lastRet ? _ret.data()[0].curDom : v.groupDom.children[0].children[0]),
                }
            })[0].tool;
            let cls = Toolbar.getCls(tool);
            _ret.update(d => {
                d.curDom = v.dom;
            });
            v.groupDom.classList.remove(cls);
            if (me._lastRet) {
                me._lastRet.dom.classList.remove("active");
                me._lastRet.groupDom.classList.remove("active");
            }
            v.groupDom.classList.add(v.cls);
            me.mEvent.execute("tool-change", me._lastRet && me._lastRet.tool, v.tool);
            v.dom.classList.add("active");
            v.groupDom.classList.add("active");
            me._lastRet = ret[0];
        }
    }

    Toolbar.icoM = {
        Picker: "icon-compass",
        Line: ["icon-flow-line", 1],
        Rect: ["icon-square2", 1],
        MultiShape: ["icon-star-empty", 1],
        Pen: ["icon-pen", 2],
        Pencil: ["icon-pencil", 2],
        Text: "icon-font",
        Mirror: ["icon-page-break", 3],
        Rotation: ["icon-redo", 3],
    }
    Toolbar.getCls = (t) => {
        let v = Toolbar.icoM[t.name];
        let cls;
        if (v.constructor === Array && v.length > 1) {
            cls = v[0];
        } else {
            cls = v;
        }
        return cls;
    }

    UI.Toolbar = Toolbar;
}