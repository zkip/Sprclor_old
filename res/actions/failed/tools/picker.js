Tool.Picker = class extends Tool {
    constructor(ins) {
        super("Picker", ins);
        let me = this;
        let oprL = me.instance.workspace.oprLayer;
        let hitOpt = {
            segments: true,
            stroke: true,
            fill: true,
            tolerance: 5
        };
        let {
            tree
        } = this.instance;
        this.hovered = null;
        this.operator = new Path.Operator();
        this.operator.strokeColor = "red";
        this.operator.reset();
        oprL.addChild(this.operator);
        this.selection = this.operator.selection;
        this.selection.on("add-after", (_, item) => {
            let [ti] = tree.__.get(item);
            ti && tree.selection.append(ti);
        }).on("rm-after", (_, item) => {
            let [ti] = tree.__.get(item);
            tree.selection.rmByValue(ti);
        }).on("clear-before", () => {
            tree.selection.clear();
        })
        /*
        0 nothing
        1 selecting
        2 operating
        */
        this.state = 0;
        this._g = {
            area: new Path({
                segments: [
                    [],
                    [],
                    [],
                    []
                ],
                closed: true,
                strokeColor: "red",
                visible: false,
                data: {
                    type: "area",
                },
            }),
        }
        oprL.addChild(this._g.area);

        this.shape = new Shape.Rect();
        // :item/null
        let hit = (p) => {
            let {
                project,
                view
            } = me.instance.paper;
            hitOpt.tolerance = 5 / view.scaling.x;
            let hitResult = project.hitTest(view.viewToProject(p[0], p[1]), hitOpt);
            return hitResult || null;
        }
        let boundsAction = {
            set: 0x0,
            unite: 0x1,
            reduce: 0x2,
            reverse: 0x3,
        };
        let _update = (bact, items, relSct) => {
            let sct = me.operator.selection;
            sct.clear();
            if (bact === boundsAction.set) {
                sct.append(...items);
            } else {
                if (bact === boundsAction.unite) {
                    sct.add(relSct);
                    sct.append(...items);
                } else if (bact === boundsAction.reduce) {
                    sct.add(relSct);
                    sct.rmByValue(...items);
                } else if (bact === boundsAction.reverse) {
                    sct.add(relSct);
                    items.forEach(item => {
                        if (relSct.exist(item)) {
                            sct.rmByValue(item);
                        } else {
                            sct.append(item);
                        }
                    });
                } else {
                    sct.clear();
                }
            }
        }
        let _select = (bact, e, relSct) => {
            me._g.area.visible = true;
            let bound = me.instance.workspace.dom.getBoundingClientRect();
            let iP = me.instance.paper.view.
            viewToProject(e.clientX - bound.left, e.clientY - bound.top);
            let prevState = me.state;
            let iCP = new Vec(e.clientX, e.clientY);
            let noRect = true;
            let _move = (e) => {
                me.state = 1;
                let {
                    clientX,
                    clientY
                } = e;
                let nCP = new Vec(e.clientX, e.clientY);
                if (iCP.subtract(nCP).length < 5) {
                    noRect = true;
                    return
                }
                noRect = false;
                let p = me.instance.paper.view.
                viewToProject(clientX - bound.left, clientY - bound.top);
                me.shape.setSize(iP, p.subtract(iP));
                me._updateSegments();
                let items = paper.project.getItems({
                    overlapping: me.shape.toBounds(),
                    match: (item) => {
                        if (item.constructor === Layer) {
                            return false;
                        }
                        if (item.layer === oprL) {
                            return false;
                        }
                        return true;
                    }
                });
                _update(bact, items, relSct);
            }
            let _up = e => {
                let p = me.instance.paper.view.
                viewToProject(e.clientX - bound.left, e.clientY - bound.top);
                me.state = prevState;
                me._g.area.visible = false;
                me.shape.setSize(new Vec(), new Vec());
                me._updateSegments();
                if (noRect && bact === boundsAction.set) {
                    _update(bact, [], relSct);
                };
                removeEventListener("mousemove", _move);
                removeEventListener("mouseup", _up);
            }
            addEventListener("mousemove", _move);
            addEventListener("mouseup", _up);
        }
        let _drag = () => {}
        let _opr = (e) => {
            let hitRet = hit([e.layerX, e.layerY]);
            if (!hitRet) return;
            let item = hitRet.item;
            let loctIdx = hitRet.location && hitRet.location.index;
            if (!item) return;
            if (!(item.parent instanceof Path.Operator)) return;
            let {
                data
            } = item;
            if (!data) return;
            let {
                type,
                index
            } = data;
            let _ = {
                cornerRotate: "rotateByCorner",
                cornerScale: "scaleByCorner",
                sideScale: "scaleBySide",
                drag: "drag",
                pivot: "setPivotU",
            };
            let oprT = _[type];
            if (!oprT) return;
            let ix = e.clientX,
                iy = e.clientY;
            let bound = me.instance.workspace.dom.getBoundingClientRect();
            let iP = me.instance.paper.view.
            viewToProject(ix - bound.left, iy - bound.top);
            let operator = me.operator;
            operator.save(iP);
            let fn = operator[oprT];
            me.selection.forEach((_, item) => {
                if (!item.autoPivot) return;
                if (oprT === "scaleByCorner")
                    operator.setPivotM(operator.nextIdx(operator.nextIdx(index)));
                if (oprT === "rotateByCorner")
                    operator.setPivotM();
                if (oprT === "scaleBySide") {
                    let _ = loctIdx % 2,
                        _loctIdx = loctIdx,
                        x = 0,
                        y = 0;
                    _ ? (_loctIdx -= 2, y = _loctIdx) : (_loctIdx -= 1, x = -_loctIdx);
                    operator.setPivotM(x, y);
                }
            });
            let _move = e => {
                let {
                    clientX,
                    clientY
                } = e;
                let p = me.instance.paper.view.
                viewToProject(clientX - bound.left, clientY - bound.top);
                fn.call(operator, p, loctIdx % 2);
            };
            let _up = e => {
                operator.restore();
                removeEventListener("mousemove", _move);
                removeEventListener("mouseup", _up);
            }
            addEventListener("mousemove", _move);
            addEventListener("mouseup", _up);
        }
        let {
            oprLayer,
            objectLayer
        } = me.instance.workspace;
        this.fn = {
            _move: (e) => {
                if (me.state !== 0) return;
                let hitRet = hit([e.layerX, e.layerY]);
                let item = hitRet && hitRet.item;
                if (item) {
                    if (item.layer === oprLayer) return;
                    if (me.hovered !== item) {
                        let [ti] = tree.__.get(me.hovered);
                        me.hovered && !tree.selection.exist(ti) &&
                            (me.hovered.selected = false);
                        item.selected = true;
                        [ti] = this.instance.tree.__.get(item);
                        this.instance.tree.hover(ti);
                        me.hovered = item;
                    }
                } else {
                    if (me.hovered) {
                        let [ti] = tree.__.get(me.hovered);
                        if (!tree.selection.exist(ti))
                            me.hovered.selected = false;
                        me.hovered = null;
                        me.instance.tree.hover(null);
                    }
                }
            },
            _down: e => {
                let {
                    layerX,
                    layerY,
                    which
                } = e;
                let bact = boundsAction.set;
                if (e.shiftKey) {
                    bact = boundsAction.unite;
                } else if (e.altKey) {
                    bact = boundsAction.reduce;
                } else if (e.ctrlKey) {
                    bact = boundsAction.reverse;
                }
                if (which === 2) return;
                let hitRet = hit([layerX, layerY]);
                let relSct = new Selection().set(me.selection);
                if (hitRet && hitRet.item) {
                    let item = hitRet.item;
                    if (item.layer === oprLayer) {
                        _opr(e);
                    } else {
                        _update(bact, [item], relSct);
                    }
                } else {
                    _select(bact, e, relSct);
                }
            },
        };
    }
    onMe() {
        let me = this;
        this.instance.workspace.dom.addEventListener("mousedown", this.fn._down);
        this.instance.workspace.dom.addEventListener("mousemove", this.fn._move);
        this.instance.workspace.dom.addEventListener("mouseout", () => {
            if (me.hovered) {
                me.hovered.selected = false;
                me.hovered = null;
            }
            me.instance.tree.hover(null);
        });
        this.operator.reset();
        // this.operator.set(...me.instance.workspace.objectLayer.children);
    }
    offMe() {
        removeEventListener("mousedown", this.fn._down);
        console.log(this.name, "has gone.");
    }
    getHoveredItem() {
        return this.hovered;
    }
    getSelectedItems() {
        return this.selectedM;
    }
    _updateSegments() {
        for (let i = 0, c = 0; i < 8; i += 2, c++) {
            let x = this.shape._vertex[i],
                y = this.shape._vertex[i + 1];
            this._g.area.segments[c].point.set(x, y);
        }
    }
}