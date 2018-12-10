{
    // lopt: Layer Option
    let loptM = {
        both: 0,
        opr: 1,
        obj: 2,
    };
    class View extends UI {
        constructor(d) {
            super("View", d);
            let me = this;
            this.hitOpt = {
                segments: false,
                stroke: true,
                fill: true,
                tolerance: 5,

                lopt: "obj", // obj/opr/both
                inner: false, // 是:只选择Fragment，否:只选择GObj
                isGrouped: true, // 只有当inner为false时才生效。是否把顶层组作为一个整体
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
                // 需要做兼容处理
                let {
                    deltaY,
                    clientX,
                    clientY
                } = e;
                let p = view.viewToProject(clientX - ox, clientY - oy);
                let ss = view.scaling.x;
                if (abs(deltaY) < 100) {
                    // 精确滚动，如笔记本的触摸板
                } else {
                    let v = deltaY / 100 >> 0;
                    v = v > 5 ? 5 : v;
                    v = v < -5 ? -5 : v;
                    ss = 1 - v * scs[abs(v) - 1] * 0.15;
                    view.scale(ss, p);
                    me.mEvent.execute("viewScaling", view.scaling.x);
                }
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
        // Vec UI.View.lopt *fn >> []Item/null
        hit(p, opt, fn) {
            let hitOpt = assign(opt || {}, this.hitOpt, "define"),
                me = this;
            let {
                _project
            } = this;
            hitOpt.tolerance /= this._view.scaling.x;
            let lo = loptM[hitOpt.lopt];
            hitOpt.match = (item) => {
                if (lo === 0) return true;
                if (lo === 1 && !me._inOprL(item.item)) return false;
                if (lo === 2 && !me._inObjL(item.item)) return false;
                if (!isUndefined(fn)) return fn(item.item);
                return true;
            }
            let ret = _project.hitTest(p, hitOpt);
            if (!hitOpt.inner && ret && ret.item instanceof Fragment) {
                ret.item = ret.item.parent;
                if (hitOpt.isGrouped && ret.item.topParent) {
                    ret.item = ret.item.topParent;
                }
            }
            return ret;
        }
        // : uint
        size(lo) {
            let layer = this._layer.obj;
            lo = loptM[lo];
            if (lo === 1) {
                layer = this._layer.opr;
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
            lo = loptM[lo];
            if (lo === 1) {
                layer = this._layer.opr;
            }
            layer.insertChildren(idx, _items);
            return this;
        }
        getItemsByRect(rect, opt, fn) {
            let me = this;
            let hitOpt = assign(opt || {}, this.hitOpt, "define");
            let lo = loptM[hitOpt.lopt];
            let ret = this._project.getItems({
                overlapping: rect,
                match: (item) => {
                    if (me.hitOpt.inner) {
                        if (!(item instanceof Fragment)) return false;
                    } else {
                        if (!(item instanceof Path)) return false;
                    }
                    if (lo === 0) return true;
                    if (lo === 1 && !me._inOprL(item)) return false;
                    if (lo === 2 && !me._inObjL(item)) return false;
                    if (!isUndefined(fn)) return fn(item);
                    return true;
                }
            }).map(v => {
                return (hitOpt.isGrouped && v.topParent) ? v.topParent : v;
            })
            return ret;
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
        getChildren() {
            return this._layer.obj.children;
        }
        lookAtOrigin() {
            this._view.translate(this._view.center);
            return this;
        }
        _inOprL(item) {
            return item.layer === this._layer.opr;
        }
        _inObjL(item) {
            return item.layer === this._layer.obj;
        }
        getScaling() {
            return this._view.scaling.x;
        }
    }
    UI.View = View;
}