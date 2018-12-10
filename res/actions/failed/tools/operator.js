{
    let lopt = UI.View.lopt;
    let cornerM = [
        [-1, -1],
        [-1, 1],
        [1, 1],
        [1, -1],
    ];
    let oprT = {
        corner: "scaleByCorner",
        bounds: "scaleBySide",
        rotate: "rotate",
        drag: "drag",
        pivot: "setCenter",
    };
    class Operator extends Tool {
        constructor() {
            super("Operator");
            let me = this;
            assign(this, {
                rect: null,
                bounds: new Bounds(),
                matrix: new Matrix,
                pivot: new Vec,
                autoPivot: true,
                backup: {
                    mps: new Map,
                    start: new Vec(),
                    end: new Vec(),
                    guidesData: {},
                },
            });
            this.mEvent.expand(
                "updateSegments", "updatePivot",
                "scaleByCorner", "scaleBySide", "rotate", "drag", "changePivot", "transform",
            );
            // this._record = {
            //     pivot: new Vec(),
            //     pivots: new Map(),
            //     loctIdx: null,
            //     isPts: false,
            //     oprT: "",
            // };
            let update = () => {
                let len = me.items.len();
                me._updateBounds();
                if (len === 0) {
                    me.hiddenGuides();
                    me.guides.get("root", (k, v) => {
                        v.mp.reset();
                    });
                } else {
                    if (len === 1) {
                        let item = me.items.getByIndex(0);
                        if (isUndefined(item.autoPivot) || item.autoPivot) {
                            me.setPivot();
                        } else {
                            me.setPivot(item.getPivot());
                        }
                        me.autoPivot = item.autoPivot;
                        me.guides.get("root", (k, v) => {
                            v.mp.setAddtion(item.mp.getGlobal());
                        });
                    } else {
                        me.autoPivot = true;
                        me.guides.get("root", (k, v) => {
                            v.mp.reset();
                        });
                        me.setPivot();
                    }
                    me.showGuides();
                }
                me._updateSegments();
            }
            this.items = new SelectionEv().on("add-after", update).on("rm-after", update)
                .on("clear-before", () => {
                    me.hiddenGuides();
                    me.setPivot();
                    me._updateBounds();
                    me._updateSegments();
                });
        }
        init() {
            let action = {
                mousedown: e => {
                    if (which === 2) return;
                    let ICP = e.toClientVec();
                    let ICP_W = view.globalToLocal(ICP);
                    let hitRet = view.hit(ICP_W, lopt.obj);
                    let hitRetOpr = view.hit(ICP_W, lopt.opr);
                    let objItem = hitRet && hitRet.item;
                    let oprItem = hitRetOpr && hitRetOpr.item;

                    let isDragSct = false,
                        isImediatelyDrag = false,
                        isOpr = false;

                    let loctIdx, oprFn;

                    let isMoved = false;

                    let _operatorMM = {
                        cornerRotate: "rotate",
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
                            if (isUndefined(loctIdx)) {
                                loctIdx = oprData.data.index;
                            }
                        }
                        if (oprT) {
                            me.state.operating = true;
                            operator.record({
                                startVec: ICP_W,
                                loctIdx: loctIdx,
                                oprT: oprT,
                            }).save();
                            me.state.operating = true;
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
                                operator.review();
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
                                operator.reset();
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
                                this.rect = new Shape.Rect();
                                me._g.area.visible = false;
                            }
                            me._updateSegments();
                            domEv.rmByValue(drag);
                        },
                    }
                    domEv.append(drag);
                },
            }
        }
        record(opt) {
            let me = this;
            let {
                start,
                end,
                guidesData,
                hitRetOpr,
            } = opt || {};
            start && this.backup.start.set(start);
            end && this.backup.end.set(end);
            guidesData && (this.backup.guidesData = guidesData);
            if (hitRetOpr && guidesData.sub === "bounds") {
                let location = hitRetOpr.location;
                this.backup.loctIdx = location.index;
            }
            return this;
        }
        recordMps() {
            let me = this;
            this.items.forEach((_, item) => {
                item.applyMatrix = false;
                me.backup.mps.set(item, item.mp.clone());
                // me.backup.pivots.set(item, item.vPivot.clone());
            });
        }
        apply() {
            let data = this.backup.guidesData;
            let sub = this.backup.guidesData.sub;
            if (sub === "corner") {
                this.setPivot(this.guides.get("bounds").firstKey().loopIdx(data.idx, 2));
            }
            let fN = oprT[sub];
            fN && this[fN]();
            // this[oprT]();
        }
        reset() {
            this.backup.mps = new Map();
        }
        scaleByCorner() {
            let me = this;
            let bStart = this.backup.start;
            let bEnd = this.backup.end;
            let idx = this.backup.guidesData.idx;
            this.mEvent.execute("scaleByCorner");
            let root = this.guides.get("root").firstKey();
            let bounds = this.guides.get("bounds").firstKey();
            let mp = root.mp;

            this.items.forEach((_, item) => {
                let mp = me.backup.mps.get(item);
                if (!mp) return;
                // let pivot = (me.pivot);
                let start = root.mp.toLocal(bStart);
                let end = root.mp.toLocal(bEnd);
                let pos = root.mp.toLocal(mp.getPosition());
                let iv = start.subtract(pos);
                let nv = end.subtract(pos);
                let oft = nv.divide(iv).add(new Vec(-1, -1));
                let scl = mp.getScaling();
                // item.mp.setScaling(scl.add(root.mp.toLocal(oft)));
                // let pivot = item.mp.toLocal(me.pivot);
                // let start = item.mp.toLocal(bStart);
                // let end = item.mp.toLocal(bEnd);
                // console.log(item.mp.get(),bStart.subtract(bEnd),start.subtract(end));
                // let iv = start.subtract(pivot);
                // let m = new Matrix();
                // let nVec = end.subtract(pivot);
                // let retVec = new Vec();
                // let x = iv.x,
                //     y = iv.y;
                // if (x !== 0 && y !== 0) {
                //     retVec.set(nVec.divide(iv));
                // } else if (x === 0 && y === 0) {} else {
                //     retVec.set(nVec.divide(x + y));
                // }
                // let abs = Math.abs;
                // let esp = 1e-45;
                // if (abs(retVec.x) < esp || abs(retVec.y) < esp) {
                //     return;
                // }
                // m.scale(retVec, pivot);
                // item.mp.set(om.prepended(m));
            });
            this._updateBounds();
            this._updateSegments();
        }
        scaleBySide() {
            let me = this;
            let pivot = this.pivot;
            let iVec = this._record.startVec.subtract(pivot);
            let cross = this._record.loctIdx % 2;
            let isPts = this._record.isPts;
            let endVec = this._record.endVec;
            if (isPts) {

            } else {
                this.items.forEach((_, item) => {
                    let om = me._record.matrixes.get(item);
                    if (!om) return;
                    let m = new Matrix();
                    let nVec = endVec.subtract(pivot);
                    let retVec = new Vec();
                    let x = iVec.x,
                        y = iVec.y;
                    if (x !== 0 && y !== 0) {
                        retVec.set(nVec.divide(iVec));
                    } else if (x < 1e-45 && y < 1e-45) {
                        return;
                    } else {
                        retVec.set(nVec.divide(x + y));
                    }
                    if (cross) {
                        retVec.x = 1;
                    } else {
                        retVec.y = 1;
                    }
                    let abs = Math.abs;
                    let esp = 1e-45;
                    if (abs(retVec.x) < esp || abs(retVec.y) < esp) {
                        return;
                    }

                    m.scale(retVec, pivot);
                    item.matrix = om.prepended(m);
                    this._updateBounds();
                    this._updateSegments();
                })
            }
        }
        rotate() {
            let me = this;
            let pivot = this.pivot;
            let iVec = this._record.startVec.subtract(pivot);
            let endVec = this._record.endVec;
            this.items.forEach((_, item) => {
                let om = me._record.matrixes.get(item);
                if (!om) return;
                let m = new Matrix();
                let nVec = endVec.subtract(pivot);
                let angle = iVec.getDirectedAngle(nVec);
                m.rotate(angle, pivot);
                item.matrix = om.prepended(m);
                this._updateBounds();
                this._updateSegments();
            });
        }
        drag() {
            let me = this;
            let iVec = this._record.startVec;
            let mVec = this._record.endVec.subtract(iVec);
            this.pivot.set(this._record.pivot.add(mVec));
            let isSingle = false;
            if (this.items.len() === 1) {
                isSingle = true;
            }
            this.items.forEach((_, item) => {
                let vPivot = me._record.pivots.get(item);
                if (!item.autoPivot) {
                    item.vPivot.set(vPivot.add(mVec));
                }
                let om = me._record.matrixes.get(item);
                if (!om) return;
                let m = new Matrix();
                m.translate(mVec);
                item.matrix = om.prepended(m);
                me._updateBounds();
                me._updateSegments();
            })
        }
        setCenter() {
            let me = this;
            let end = this.backup.end;
            let rmp = this.guides.get("root").firstKey().mp;
            if (this.items.len() === 1) {
                this.items.forEach((_, item) => {
                    item.mp.setCenter(end);
                    me.setPivot(rmp.toLocal(end));
                })
            }
        }
        /* boundry position flag
            -1,-1 0,-1 1,-1
            -1,0  0,0  1,0
            -1,1  0,1  1,1
        */
        // Point/number/(left,top *boundry position flag*)/nil :
        setPivot() {
            let me = this;
            let {
                pivot,
                bounds
            } = this;
            // center
            if (arguments.length === 0) {
                pivot.set(bounds.center);
            } else if (arguments.length === 2) {
                let l = arguments[0],
                    t = arguments[1],
                    x, y;
                if (l === -1) {
                    x = this.rect._vertex[0];
                } else if (l === 0) {
                    let w = this.rect._vertex[4] - this.rect._vertex[0];
                    x = this.rect._vertex[0] + w / 2;
                } else if (l === 1) {
                    x = this.rect._vertex[4];
                }
                if (t === -1) {
                    y = this.rect._vertex[1];
                } else if (t === 0) {
                    let h = this.rect._vertex[5] - this.rect._vertex[1];
                    y = this.rect._vertex[1] + h / 2;
                } else if (t === 1) {
                    y = this.rect._vertex[5];
                }
                pivot.set(new Vec(x, y));
            } else if (arguments[0] instanceof Vec) {
                // point
                pivot.set(arguments[0]);
            } else if (typeof arguments[0] === "number") {
                // corner index
                let idx = arguments[0];
                let bounds = this.guides.get("bounds").firstKey();
                let corner = bounds.getCorner(idx);
                pivot.set(corner);
            }
            this.mEvent.execute("updatePivot");
            return this;
        }
        initGuides() {
            let me = this;
            let ins = this.getIns();
            let view = ins.ui.get("view");
            let root = this.keyg.get("root");

            let cornerScale = new Group();
            let rotateCircle = new Guide.Circle().init(view).setRadius(25);
            rotateCircle.isFixed = false;
            rotateCircle.style.set({
                dashArray: [5, 5],
                fillColor: null,
            })
            let pivotPoint = new Guide.Circle().init(view).setRadius(5);
            let originCross; {
                let h1 = new Guide.Line().init(view).setRadius(5);
                let h2 = new Guide.Line().init(view).setRadius(5).setAngle(90);
                originCross = new Group();
                originCross.addChild(h1);
                originCross.addChild(h2);
                originCross.style.set({
                    strokeColor: "#f9f90f",
                    strokeWidth: 1,
                });
            }
            let bounds = new Rect();
            bounds.style.set({
                dashArray: [5, 5],
                strokeWidth: 1,
            });
            let drag = new Rect();
            drag.style.set({
                fillColor: "black",
            })
            drag.opacity = 0;

            let csG = [];
            for (let i = 0; i < 4; i++) {
                let rc = new Guide.Rect();
                rc.init(view);
                rc.setRadius(new Vec(2.5, 2.5));
                rc.style.set({
                    fillColor: "#f3f3f3",
                });
                csG[i] = rc;
                cornerScale.addChild(rc);
                this.setGuidesData(rc, "corner", {
                    idx: i
                });
            }
            this.mEvent.add("updatePivot", () => {
                rotateCircle.setCenter(me.pivot);
                pivotPoint.setCenter(me.pivot);
            })
            let boundsG = bounds;
            this.mEvent.add("updateSegments", () => {
                let bounds = me.bounds;
                let radius = root.mp.toGlobal(bounds.topLeft).subtract(root.mp.toGlobal(bounds.bottomRight)).divide(2);
                boundsG.fromTo(bounds.topLeft, bounds.bottomRight);
                drag.fromTo(bounds.topLeft, bounds.bottomRight);
                for (let i = 0; i < 4; i++) {
                    csG[i].setCenter(boundsG.getCorner(i));
                }
                rotateCircle.setRadius(radius.length * 1.2);
                me.mEvent.execute("updatePivot");
            })
            this.hiddenGuides();

            root.addChild(drag);
            root.addChild(bounds);
            root.addChild(rotateCircle);
            root.addChild(cornerScale);
            root.addChild(originCross);
            root.addChild(pivotPoint);

            root.strokeScaling = false;
            root.strokeColor = "red";
            pivotPoint.style.set({
                strokeColor: "rgba(200,100,50,0.3)",
                fillColor: "rgba(200,100,50,0.7)",
                strokeWidth: 1,
            })

            this.setGuidesData(bounds, "bounds");
            this.setGuidesData(root, "root");
            this.setGuidesData(drag, "drag");
            this.setGuidesData(cornerScale, "cornerScale");
            this.setGuidesData(rotateCircle, "rotate");
            this.setGuidesData(pivotPoint, "pivot");

            // view.mEvent.add("viewScaling", (s) => {
            //     me._g.centerPoint.applyMatrix = false;
            //     me._g.pivotPoint.applyMatrix = false;
            //     me._g.centerPoint.scaling.set(1 / s, 1 / s);
            //     me._g.pivotPoint.scaling.set(1 / s, 1 / s);
            //     me._g.cornerRotate.forEach((g, c) => {
            //         let x = me.shape._vertex[c * 2],
            //             y = me.shape._vertex[c * 2 + 1];
            //         g.position.set(x + _[c][0] * 15 / s, y + _[c][1] * 15 / s);
            //         g.applyMatrix = false;
            //         g.scaling.set(1 / s, 1 / s);
            //     });
            //     me._g.cornerScale.forEach(g => {
            //         g.applyMatrix = false;
            //         g.scaling.set(1 / s, 1 / s);
            //     });
            // })
            // for (let i = 0; i < 4; i++) {
            //     let rect = new Rectangle({
            //         size: [5, 5],
            //         fillColor: "#dedede",
            //         strokeScaling: false,
            //     });
            //     let rect2 = rect.clone();
            //     rect2.scale(2);
            //     rect2.applyMatrix = true;
            //     rect2.data = {
            //         index: i,
            //         type: "operator",
            //         sub: "cornerRotate",
            //     };
            //     this._g.cornerScale.push(rect);
            //     this._g.cornerRotate.push(rect2);
            //     this._addG(rect2);
            //     this._addG(rect);
            // }
        }
        _updateBounds() {
            let b = null;
            let fnN = "getGlobalBounds";
            if (this.items.len() === 1) {
                fnN = "getResetBounds";
            }
            this.items.forEach((_, v) => {
                let item = v;
                !b ? (b = item[fnN]()) : (b = b.unite(item[fnN]()));
            });
            if (b) {
                this.bounds = b;
            }
            return this;
        }
        _updateSegments() {
            let me = this;
            // if (this.items.len() === 1) {
            //     this.items.forEach((_, item) => {
            //         me.guides.get("root", (k, v) => {
            //             v.mp.setAddtion(item.mp.getGlobal());
            //         });
            //     })
            // } else {
            //     me.guides.get("root", (k, v) => {
            //         v.mp.reset();
            //     });
            //     // this.items.forEach((_, item) => {
            //     //     me.guides.get("root", (k, v) => {
            //     //         v.mp.setAddtion(item.mp.getGlobal());
            //     //     });
            //     // })
            // }
            this.mEvent.execute("updateSegments");
        }
    }
    Tool.Operator = Operator;
}