{
    let boundsAction = {
        set: 0x0,
        unite: 0x1,
        reduce: 0x2,
        reverse: 0x3,
    };
    class Picker extends Tool {
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
            this.rect = null;
        }
        init() {
            let me = this,
                ins = me.getIns(),
                view = ins.ui.get("view"),
                tree = ins.ui.get("tree"),
                operator = this.operator,
                area = me.guides.get("area").firstKey();
            operator.setIns(ins);
            operator._init();
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
            let lastHitTime = null,
                lastItem = null,
                lastHitPos = new Vec();
            let action = {
                mousedown: e => {
                    let which = e.which;
                    let bact = boundsAction.set;
                    let relSct = new Selection().set(me.selection);
                    let isMoved = false,
                        isDragSct = false;
                    let isGrouped = true;
                    if (e.shiftKey) {
                        bact = boundsAction.unite;
                    } else if (e.altKey) {
                        bact = boundsAction.reduce;
                    } else if (e.ctrlKey) {
                        bact = boundsAction.reverse;
                        isGrouped = false;
                    }
                    let isBact = false;
                    if (bact !== boundsAction.set) isBact = true;
                    if (which === 2) return;
                    let ICP = e.toClientVec();
                    let ICP_W = view.globalToLocal(ICP);
                    let hitRet = view.hit(ICP_W,{
                        isGrouped: isGrouped,
                    });
                    let hitRetOpr = view.hit(ICP_W, {
                        lopt: "opr",
                        isGrouped: false,
                    });
                    let objItem = hitRet && hitRet.item;
                    let oprItem = hitRetOpr && hitRetOpr.item;

                    let data = me.operator.getGuidesData(oprItem);
                    let isOperatorItem = !!data;

                    if (objItem && (!oprItem || isBact)) {
                        _updateSct(bact, [objItem], relSct);
                    }
                    if (!objItem && (!oprItem || !isOperatorItem)) {
                        _updateSct(bact, [], relSct);
                        isDragSct = true;
                    }
                    me.operator.record({
                        start: ICP_W,
                        guidesData: isOperatorItem ? data : {},
                        hitRetOpr: hitRetOpr,
                    }).recordMps();
                    let drag = {
                        mousemove: e => {
                            let NCP = e.toClientVec();
                            let NCP_W = view.globalToLocal(NCP);
                            isMoved = true;
                            let isNoRect = true;
                            if (isDragSct && NCP.subtract(ICP).length > 5) {
                                isNoRect = false;
                                me.showGuides();
                            } else {
                                me.hiddenGuides();
                            }
                            if ((isDragSct || isBact) && !isNoRect) {
                                let items = view.getItemsByRect(area.fromTo(ICP_W, NCP_W).toBounds());
                                me._updateSegments();
                                _updateSct(bact, items, relSct);
                            }
                            if (isOperatorItem) {
                                me.operator.record({
                                    end: NCP_W,
                                });
                                me.operator.apply();
                            }
                        },
                        mouseup: e => {
                            let NCP = e.toClientVec();
                            let NCP_W = view.globalToLocal(NCP);
                            if (!isMoved) {
                                if (me.state.selected && !objItem) {
                                    _updateSct(bact, [], relSct);
                                } else {
                                    if (objItem) {
                                        _updateSct(bact, [objItem], relSct);
                                    }
                                }
                            } else {
                                me.hiddenGuides();
                            }
                            if (isOperatorItem) {
                                me.operator.reset();
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
                    let hitRet = view.hit(CP_W,{
                        isGrouped: !e.ctrlKey,
                    });
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

            this.mEvent.add("on", () => {
                let me = this;
                view.domEv.append(action);
                view.domEv.append(tip);
                view.domEv.append(blur);
                me.operator.apply();
            });
            this.mEvent.add("off", () => {
                let me = this;
                view.domEv.rmByValue(action);
                view.domEv.rmByValue(tip);
                view.domEv.rmByValue(blur);
                me.operator.apply();
            });
        }
        getHoveredItem() {
            return this.hovered;
        }
        initGuides() {
            let ins = this.getIns(),
                view = ins.ui.get("view"),
                operator = this.operator,
                lopt = UI.View.lopt;
            let root = this.keyg.get("root");
            let area = new Rect();
            area.style.set({
                strokeColor: "red",
            })
            root.addChild(area);
            root.style.set({
                strokeScaling: false,
            })
            this.setGuidesData(area, "area");
        }
        _updateSegments() {
            for (let i = 0, c = 0; i < 8; i += 2, c++) {
                // let x = this.shape._vertex[i],
                //     y = this.shape._vertex[i + 1];
                // this._g.area.segments[c].point.set(x, y);
            }
        }
    }
    Tool.Picker = Picker;
}