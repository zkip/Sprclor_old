Tool.Picker = class extends Tool {
    constructor() {
        super("Picker");
        this.state = {
            selecting: false,
            selected: false,
            operating: false,
        };
        this.hovered = null;
        this.operator = new Tool.Operator();
        this.selection = null;
        this.shape = new Shape.Rect();
        this._g = {};
        this._fn = {};
    }
    init() {
        let me = this,
            ins = me.getIns(),
            view = ins.ui.get("view"),
            tree = ins.ui.get("tree"),
            operator = this.operator,
            lopt = UI.View.lopt;
        operator.setIns(ins);
        operator.init();
        this.selection = operator.items;
        this.selection.on("add-after", (_, item) => {
            let [ti] = tree.__.get(item);
            ti && tree.selection.append(ti);
            me.state.selected = true;
        }).on("rm-after", (_, item) => {
            let [ti] = tree.__.get(item);
            tree.selection.rmByValue(ti);
            if (me.selection.len() === 0) {
                me.state.selected = false;
            }
        }).on("clear-before", () => {
            tree.selection.clear();
            me.state.selected = false;
        })
        this._initG();

        let boundsAction = {
            set: 0x0,
            unite: 0x1,
            reduce: 0x2,
            reverse: 0x3,
        };
        let _updateSct = (bact, items, relSct) => {
            let sct = me.operator.items;
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
        let _setPivot = (oprT, index, loctIdx) => {
            if (me.selection.len() === 1 && !operator._record.autoPivot) {
                me.selection.forEach((_, item) => {
                    let bounds = item.bounds;
                    let p = bounds.center.add(item.vPivot);
                    operator.setPivotM(p);
                });
            } else {
                if (operator._record.autoPivot) {
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
                }
            }
        }
        let lastHitTime = null,
            lastItem = null,
            lastHitPos = new Vec();
        let action = {
            mousedown: e => {
                let {
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
                let isBact = false;
                if (bact !== boundsAction.set) isBact = true;
                if (which === 2) return;
                let ICP = e.toClientVec();
                let ICP_W = view.globalToLocal(ICP);
                let hitRet = view.hit(ICP_W, lopt.obj);
                let hitRetOpr = view.hit(ICP_W, lopt.opr);
                let objItem = hitRet && hitRet.item;
                let oprItem = hitRetOpr && hitRetOpr.item;
                let relSct = new Selection().set(me.selection);

                let isDragSct = false,
                    isImediatelyDrag = false,
                    isOpr = false;

                let loctIdx, oprFn;

                let isMoved = false;

                let _operatorMM = {
                    cornerRotate: "rotateByCorner",
                    cornerScale: "scaleByCorner",
                    sideScale: "scaleBySide",
                    drag: "drag",
                    pivot: "setPivotU",
                };

                let _getOperatorData = (item) => {
                    if (!item) return;
                    let data = item.data;
                    let type = data.type,
                        sub = data.sub,
                        oprT = _operatorMM[sub];
                    if (!isUndefined(type, sub, oprT)) {
                        if (type === "operator") {
                            return {
                                type: sub,
                                data: data,
                                oprT: oprT,
                            }
                        }
                    }
                }
                let oprData = _getOperatorData(oprItem);

                /* select mode
                    + @single           !selected           item(objL):down
                    + @single_changle   selected            item(another objL):down
                    + @single_update                        item:[specifyKey down]->item:up
                    + @rect                                 nil:drag->any:end
                    + @rect                                 any:[specifyKey drag]->any:end
                    + @rect                                 any:specifyKey->any:end
                */

                /* operater mode -Operator>Item-
                    + @drag     selected    item(Operator.drag):down->any:move->any:up
                */

                if (objItem && (!oprItem || isBact)) {
                    if (!me.selection.exist(objItem)) {
                        isImediatelyDrag = true;
                    }
                    _updateSct(bact, [objItem], relSct);
                }
                if (!objItem && (!oprItem || !oprData)) {
                    _updateSct(bact, [], relSct);
                    isDragSct = true;
                }
                let pItem = isImediatelyDrag ? objItem : oprItem;
                if ((me.state.selected || isImediatelyDrag) && pItem && !isBact) {
                    let oprT = "drag";
                    if (oprData) {
                        loctIdx = hitRetOpr.location && hitRetOpr.location.index;
                        oprT = oprData.oprT;
                        _setPivot(oprT, oprData.data.index, loctIdx);
                    }
                    if (oprT) {
                        me.state.operating = true;
                        operator.record({
                            startVec: ICP_W,
                        }).save();
                        me.state.operating = true;
                        oprFn = operator[oprT];
                        isOpr = true;
                    }
                }

                let drag = {
                    mousemove: e => {
                        let NCP = e.toClientVec();
                        let NCP_W = view.globalToLocal(NCP);
                        isMoved = true;
                        let isNoRect = true;
                        if (isDragSct && NCP.subtract(ICP).length > 5) {
                            isNoRect = false;
                        }
                        if (isOpr) {
                            operator.record({
                                endVec: NCP_W,
                            });
                            oprFn.call(operator, loctIdx % 2);
                        } else {
                            me._g.area.visible = !isNoRect;
                            if ((isDragSct || isBact) && !isNoRect) {
                                let items = view.getItemsByRect(me.shape.fromTo(ICP_W, NCP_W).toBounds());
                                me._updateSegments();
                                _updateSct(bact, items, relSct);
                            }
                        }
                    },
                    mouseup: e => {
                        let NCP = e.toClientVec();
                        let NCP_W = view.globalToLocal(NCP);
                        if (isOpr) {
                            operator.restore();
                            me.state.operating = false;
                        }
                        if (!isMoved) {
                            if (me.state.selected && !objItem) {
                                _updateSct(bact, [], relSct);
                            } else {
                                if (objItem) {
                                    _updateSct(bact, [objItem], relSct);
                                }
                            }
                        } else {
                            this.shape = new Shape.Rect();
                            me._g.area.visible = false;
                        }
                        me._updateSegments();
                        domEv.rmByValue(drag);
                    },
                }
                domEv.append(drag);
            }
        };
        let tip = {
            mousemove: (e) => {
                let CP = e.toClientVec();
                let CP_W = view.globalToLocal(CP);
                let hitRet = view.hit(CP_W, lopt.obj);
                let item = hitRet && hitRet.item;
                let isVaild = me.state.operating;
                if (me.hovered !== item || isVaild) {
                    if (!item || isVaild) {
                        if (me.hovered) {
                            let [ti] = tree.__.get(me.hovered);
                            if (!tree.selection.exist(ti))
                                me.hovered.selected = false;
                            me.hovered = null;
                            tree.hover(null);
                        }
                    } else {
                        let [ti] = tree.__.get(me.hovered);
                        me.hovered && !tree.selection.exist(ti) &&
                            (me.hovered.selected = false);
                        item.selected = true;
                        [ti] = tree.__.get(item);
                        tree.hover(ti);
                        me.hovered = item;
                    }
                }
            }
        };
        let blur = {
            mouseout: e => {
                if (me.hovered) {
                    me.hovered.selected = false;
                    me.hovered = null;
                }
                tree.hover(null);
            }
        };
        this._fn.action = action;
        this._fn.tip = tip;
        this._fn.out = blur;

        this.mEvent.add("on", () => {
            let me = this;
            me.applyFn();
            me.operator.reset();
        });
        this.mEvent.add("off", () => {
            let me = this;
            me.clearFn();
            me.operator.reset();
        });
    }
    applyFn() {
        let ins = this.getIns(),
            view = ins.ui.get("view");
        view.domEv.append(this._fn.action);
        view.domEv.append(this._fn.tip);
        view.domEv.append(this._fn.blur);
        return this;
    }
    clearFn() {
        let ins = this.getIns(),
            view = ins.ui.get("view");
        view.domEv.rmByValue(this._fn.action);
        view.domEv.rmByValue(this._fn.tip);
        view.domEv.rmByValue(this._fn.blur);
        return this;
    }
    getHoveredItem() {
        return this.hovered;
    }
    _initG() {
        let ins = this.getIns(),
            view = ins.ui.get("view"),
            operator = this.operator,
            lopt = UI.View.lopt;
        this._g.area = new Path({
            segments: [
                [],
                [],
                [],
                []
            ],
            closed: true,
            strokeColor: "red",
            strokeScaling: false,
            visible: false,
            data: {
                type: "area",
                tool: Path.Picker,
            },
        });
        view.addChildren(this._g.area, lopt.opr);
    }
    _updateSegments() {
        for (let i = 0, c = 0; i < 8; i += 2, c++) {
            let x = this.shape._vertex[i],
                y = this.shape._vertex[i + 1];
            this._g.area.segments[c].point.set(x, y);
        }
    }
}