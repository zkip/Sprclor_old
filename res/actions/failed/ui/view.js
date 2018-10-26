{
    // lopt: Layer Option
    let lopt = GenConst(
        'both',
        'opr',
        'obj',
    );
    class View extends UI {
        constructor(d) {
            super("View", d);
            let me = this;
            this.hitOpt = {
                segments: true,
                stroke: true,
                fill: true,
                tolerance: 5
            };
            this.mEvent = new MEvent("viewScaling", "frame");
            this._project = null;
            this._view = null;
            this._layer = {
                opr: null,
                obj: null,
            };
            this.domEv = new DomEv(this.dom);
        }
        init(p) {
            return this.initByPaper(p);
        }
        initByPaper(paper) {
            let me = this,
                ins = me.getIns();
            let {
                abs,
            } = Math;
            let cvs = document.createElement("canvas"),
                dom = me.dom;
            dom.appendChild(cvs);
            paper.setup(cvs);
            let project = paper.project,
                view = paper.view;
            this._project = project;
            this._view = view;
            let objl = project.activeLayer;
            let oprl = new Layer();
            project.addLayer(oprl);
            me._layer.opr = oprl;
            me._layer.obj = objl;
            oprl.data = "oprL";
            objl.data = "objL";

            let oftRect = cvs.getBoundingClientRect();
            let ox = oftRect.left,
                oy = oftRect.top;
            let scs = [0.2, 0.4, 0.8, 0.9, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1];

            let resize = function () {
                let w = dom.offsetWidth,
                    h = dom.offsetHeight;
                cvs.width = w;
                cvs.height = h;
                view.viewSize.set(w, h);
            }
            resize();
            addEventListener("resize", resize);
            dom.addEventListener("wheel", (e) => {
                let {
                    deltaY,
                    clientX,
                    clientY
                } = e;
                let p = view.viewToProject(clientX - ox, clientY - oy);
                let v = deltaY / 100;
                v = v > 5 ? 5 : v;
                v = v < -5 ? -5 : v;

                view.scale(1 - v * scs[abs(v) - 1] * 0.15, p);
                me.mEvent.execute("viewScaling", view.scaling.x);
            })

            let isT = false;
            addEventListener("keydown", (e) => {
                if (e.code === "Space") {
                    isT = true;
                }
            })
            addEventListener("keyup", (e) => {
                if (e.code === "Space") {
                    isT = false;
                }
            })

            dom.addEventListener("mousedown", (e) => {
                if (isT || e.button === 1) {
                    let ix = view.matrix.tx,
                        iy = view.matrix.ty;
                    let {
                        clientX: sx,
                        clientY: sy
                    } = e;
                    let fn1 = (e) => {
                        let {
                            clientX,
                            clientY
                        } = e;
                        view.matrix.tx = ix + (clientX - sx);
                        view.matrix.ty = iy + (clientY - sy);
                    };
                    let fn2 = (e) => {
                        removeEventListener("mousemove", fn1);
                        removeEventListener("mouseup", fn2);
                    };
                    addEventListener("mousemove", fn1);
                    addEventListener("mouseup", fn2);
                }
            })

            let tree = ins.ui.get("tree");
            tree.items.on("move-after", (start, end) => {
                let len = tree.items.len();
                objL.move(len - start - 1, len - end - 1);
            });

            view.onFrame = (d) => {
                me.mEvent.execute("frame", d);
            }

            return this;
        }
        // Vec : Vec
        globalToLocal(v) {
            let bound = this.dom.getBoundingClientRect();
            return this._view.viewToProject(v.subtract([bound.left, bound.top]));
        }
        // Vec,Workspace.llopt:[]Item/null
        hit(p, lo, fn) {
            let hitOpt = this.hitOpt,
                me = this;
            let {
                _project
            } = this;
            hitOpt.tolerance = 5 / this._view.scaling.x;
            let isOpr = false,
                isObj = true;
            if (lo === lopt.both) {
                isOpr = isObj = true;
            } else if (lo === lopt.opr) {
                isOpr = true;
                isObj = false;
            } else if (lo === lopt.obj) {
                isObj = true;
                isOpr = false;
            }
            let isFn = typeof fn !== "undefined";
            hitOpt.match = (item) => {
                if (isOpr && isObj) return true;
                if (isOpr && !me._inOprL(item.item)) return false;
                if (isObj && !me._inObjL(item.item)) return false;
                if (isFn) return fn(item.item);
                return true;
            }
            return _project.hitTest(p, hitOpt);
        }
        // : uint
        size(lo) {
            let layer = this._layer.obj;
            if (lo === lopt.opr) {
                layer = this._layer.obj;
            }
            return layer.children.length;
        }
        // : this
        addChildren(items, lo) {
            return this.insertChildren(this.size(lo), items, lo);
        }
        // : this
        insertChildren(idx, items, lo) {
            let layer = this._layer.obj;
            let _items = items.constructor === Array ? items : [items];
            if (lo === lopt.opr) {
                layer = this._layer.opr;
            }
            layer.insertChildren(idx, _items);
            return this;
        }
        getItemsByRect(rect, lo, fn) {
            let me = this;
            let isOpr = false,
                isObj = true;
            if (lo === lopt.both) {
                isOpr = isObj = true;
            } else if (lo === lopt.opr) {
                isOpr = true;
                isObj = false;
            } else if (lo === lopt.obj) {
                isObj = true;
                isOpr = false;
            }
            let isFn = typeof fn !== "undefined";
            return this._project.getItems({
                overlapping: rect,
                match: (item) => {
                    if (item.constructor === Layer) {
                        return false;
                    }
                    if (isOpr && isObj) return true;
                    if (isOpr && !me._inOprL(item)) return false;
                    if (isObj && !me._inObjL(item)) return false;
                    if (isFn) return fn(item);
                    return true;
                }
            });
        }
        // : this
        move(start, end, lo) {
            let layer = this._layer.obj;
            if (lo === lopt.opr) {
                layer = this._layer.opr;
            }
            layer.move(start, end);
            return this;
        }
        _inOprL(item) {
            return item.layer === this._layer.opr;
        }
        _inObjL(item) {
            return item.layer === this._layer.obj;
        }
        getScale() {
            return this._view.scaling.x;
        }
    }
    View.lopt = lopt;
    UI.View = View;
}