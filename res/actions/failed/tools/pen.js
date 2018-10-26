Tool.Pen = class extends Tool {
    constructor() {
        super("Pen");
        this.item = null;
        this._g = {};
        this.__ = {};
        this.selection = new Selection();
        this.pts = new SelectionEv();
        this.seg = new SelectionEv();
        this.shape = new Shape.Rect();
        this.operator = new Tool.Operator();
    }
    set(p) {
        let me = this,
            ins = me.getIns(),
            view = ins.ui.get("view"),
            tree = ins.ui.get("tree"),
            picker = ins.tools.get("Picker");
        if (!p) {
            p = new Path({
                strokeColor: "blue",
            });
        }
        this.item = p;
        tree.items.append(new UI.Tree.Item(p, Date.now()));
        return this;
    }
    reset() {
        // g
        this._g.root.visible = false;
        this._g.willPt.visible = false;
        this._g.willSeg.visible = false;
        this._g.willPt.position.set(0, 0);
        this._g.willSeg.position.set(0, 0);

        // g index
        this._g.idx.ep.clear();
        this._g.idx.cpa.clear();
        this._g.idx.cpb.clear();
        this._g.idx.la.clear();
        this._g.idx.lb.clear();

        this.item = null;
        // this.selection.clear();
        this.pts.clear();
        this.seg.clear();
    }
    _syncAllEndPts() {
        me.itme.segments.forEach(seg => {
            let p = me.endPts.get(seg);
            p.position.set(seg.point);
        });
        return this;
    }
    _updateSegments() {
        for (let i = 0, c = 0; i < 8; i += 2, c++) {
            let x = this.shape._vertex[i];
            let y = this.shape._vertex[i + 1];
            this._g.rect.segments[c].point.set(x, y);
        }
        return this;
    }
    _updateHandle() {
        let me = this;
        this.pts.forEach((_, seg) => {
            let ep = me._g.idx.ep.get(seg);
            // console.log(me._g.idx);
            ep.position.set(seg.point);
        })
        this.seg.forEach((_, seg) => {
            let idx = me._g.idx;
            let pa = idx.cpa.get(seg),
                pb = idx.cpb.get(seg),
                la = idx.la.get(seg),
                lb = idx.lb.get(seg);
            let avg = seg.point.add(seg.handleIn),
                bvg = seg.point.add(seg.handleOut);
            pa.position.set(avg);
            pb.position.set(bvg);
            la.segments[0].point.set(seg.point);
            lb.segments[0].point.set(seg.point);
            la.segments[1].point.set(avg);
            lb.segments[1].point.set(bvg);
        });
        return this;
    }
    init() {
        let me = this,
            ins = me.getIns(),
            view = ins.ui.get("view"),
            tree = ins.ui.get("tree"),
            picker = ins.tools.get("Picker"),
            lopt = UI.View.lopt;
        this._initG();
        this.reset();
        this.operator.setIns(ins);
        this.operator.init();

        let modes = GenConst(
            'operate',
            'add',
            'bend',
            'move',
            'rm',
        );
        let mode = modes.add;
        let mme = new MEvent("change");
        mme.add("change", () => {
            if (mode === modes.operate) {}
            if (mode === modes.add) {
                me._g.willPt.visible = true;
                me._g.willSeg.visible = true;
            } else {
                me._g.willPt.visible = false;
                me._g.willSeg.visible = false;
            }
        });

        let isTipVisible = true;
        let _setTipVisible = (b) => {
            if (b) {
                isTipVisible = true;
            } else {
                isTipVisible = false;
            }
            me._g.willSeg.visible = isTipVisible;
            me._g.willPt.visible = isTipVisible;
        }

        let _getPenType = (ret) => {
            if (ret && ret.item) {
                let item = ret.item;
                let data = item.data;
                if (data) {
                    let type = data.type,
                        sub = data.sub;
                    return type === "pen" && sub;
                }
            }
        }

        let changeMode = {
            keydown: e => {
                let last = mode;
                if (e.key === "1") {
                    mode = modes.operate;
                } else if (e.key === "2") {
                    mode = modes.add;
                } else if (e.key === "3") {
                    mode = modes.bend;
                } else if (e.key === "4") {
                    mode = modes.rm;
                }
                if (last !== mode) {
                    mme.execute("change", mode);
                }
            },
        }

        let hisSeg = [];
        let add = {
            mousedown: (e) => {
                if (e.which === 2) return;
                if (mode !== modes.add) return;
                let iP = e.toClientVec();
                let iP_w = view.globalToLocal(iP);
                let isAppended = false,
                    rmed = true;
                let seg = new Segment(iP_w);
                me.pts.append(seg);
                hisSeg.push(seg);
                _setTipVisible(false);
                if (hisSeg.length > 2) {
                    let lSeg = hisSeg.shift();
                    me.seg.rmByValue(lSeg);
                }
                me._updateHandle();
                let move = {
                    mousemove: (e) => {
                        let nP = e.toClientVec();
                        let nP_w = view.globalToLocal(nP);
                        let d = iP_w.subtract(nP_w);
                        if (iP.subtract(nP).length > 5) {
                            if (!isAppended) {
                                me.seg.append(seg);
                                isAppended = true;
                            }
                            seg.handleIn.set(d);
                            seg.handleOut.set(d.negate());
                            me._updateHandle();
                            rmed = false;
                        } else {
                            if (!rmed) {
                                me.seg.rmByValue(seg);
                                rmed = true;
                            }
                            isAppended = false;
                        }
                    },
                    mouseup: (e) => {
                        // console.log(seg.index);
                        // me.handle.rmByValue(seg);
                        // me.handle.clear();
                        _setTipVisible(true);
                        me._updateHandle();
                        domEv.rmByValue(move);
                    },
                }
                domEv.append(move);
            },
        };
        let operate = {
            mousedown: e => {
                if (mode === modes.add) return;
                let iP = e.toClientVec();
                let iP_w = view.globalToLocal(iP);
                let isUpdated = false;
                let ret = view.hit(iP_w, lopt.opr, (item) => {
                    let data = item.data;
                    let type = data.type,
                        sub = data.sub;
                    return type === "pen" && (sub === "p" || sub === "cp");
                });
                if (ret) {
                    let item = ret.item,
                        sub = item.data.sub;
                    let seg;
                    let idx = me._g.idx;
                    let end = item.data.end;
                    if (sub === "p") {
                        seg = idx.ep.getKeyByValue(item);
                    } else if (sub === "cp") {
                        seg = idx["cp" + end].getKeyByValue(item);
                    }
                    me.seg.clear();
                    me.seg.append(seg);
                    let prv = seg.previous,
                        next = seg.next;
                    if (prv) me.seg.append(prv);
                    if (next) me.seg.append(next);
                    me._updateHandle();
                    let isCtrl = e.ctrlKey;
                    if (sub === "cp") {
                        item = idx["cp" + end].get(seg);
                    }
                    item.scaling.set(1.5);
                    let move = {
                        mousemove: e => {
                            let nP = e.toClientVec();
                            let nP_w = view.globalToLocal(nP);
                            if (sub === "p") {
                                seg.point.set(nP_w);
                            } else if (sub === "cp") {
                                let end = item.data.end;
                                let d = nP_w.subtract(seg.point);
                                seg["handle" + (end === "a" ? "In" : "Out")].set(d);
                                isCtrl && seg["handle" + (end === "a" ? "Out" : "In")].set(d.negate());
                            }
                            me._updateHandle();
                        },
                        mouseup: e => {
                            item.scaling.set(1);
                            domEv.rmByValue(move);
                        }
                    }
                    domEv.append(move);
                } else {
                    let lopt = UI.View.lopt;
                    let ins = me.getIns();
                    let move = {
                        mousemove: e => {
                            let nP = e.toClientVec();
                            let nP_w = view.globalToLocal(nP);
                            me.shape.fromTo(iP_w, nP_w);
                            let ret = view.getItemsByRect(me.shape.toBounds(), lopt.opr, (item) => {
                                let data = item.data;
                                return data.type === "pen" && (data.sub === "cp" || data.sub === "p");
                            });
                            ret.forEach((item)=>{
                                item.activeStyle=new Style();
                                item.activeStyle.strokeColor="blue";
                            })
                            picker.selection.clear();
                            picker.selection.append(...ret);
                            me._updateSegments();
                        },
                        mouseup: e => {
                            domEv.rmByValue(move);
                        }
                    }
                    domEv.append(move);
                }
            }
        }
        let tip = {
            mousedown: (e) => {
                // 
            },
            mouseup: (e) => {
                // 
            },
            mousemove: (e) => {
                if (!isTipVisible) return;
                if (mode !== modes.add) return;
                let p_w = view.globalToLocal(e.toClientVec());
                me._g.willPt.position.set(p_w);
                let lastSeg = me.item.segments.last();
                let willSegs = me._g.willSeg.segments;
                if (lastSeg) {
                    willSegs[0].point.set(lastSeg.point);
                    willSegs[0].handleIn.set(lastSeg.handleIn);
                    willSegs[0].handleOut.set(lastSeg.handleOut);
                    willSegs[1].point.set(p_w);
                }
            },
        };
        this.mEvent.add("on", () => {
            this._g.root.visible = true;
            // me.reset();
            me.set();
            // me.operator.reset();
            view.domEv.append(add);
            domEv.append(changeMode);
            domEv.append(operate);
            domEv.append(tip);
        });
        this.mEvent.add("off", () => {
            me.reset();
            hisSeg = [];
            // me.operator.reset();
            view.domEv.rmByValue(add);
            domEv.rmByValue(changeMode);
            domEv.rmByValue(operate);
            domEv.rmByValue(tip);
        });

        me.pts.on("add-after", (_, seg, idx) => {
            me.item.insert(idx, seg);
        });
    }
    updatePoint(vec) {

    }
    _initG() {
        let me = this,
            ins = me.getIns(),
            lopt = UI.View.lopt,
            view = ins.ui.get("view");
        let root = new Group();
        let c = new Circle({
            radius: 5,
            strokeColor: "red",
            strokeScaling: false,
        });
        let seg = new Path({
            segments: [
                [],
                []
            ],
            strokeColor: "red",
            strokeScaling: false,
        });
        let endPts = new Group();
        let handles = new Group();
        c.applyMatrix = false;
        endPts.applyMatrix = false;
        let idx = {
            ep: new Selection(), // <Segment,Circle>
            cpa: new Selection(), // <Segment,Rectangle>
            cpb: new Selection(), // <Segment,Rectangle>
            la: new Selection(), // <Segment,Line>
            lb: new Selection(), // <Segment,Line>
        };
        let rect = new Path({
            strokeColor: "blue",
            strokeScaling: false,
            dashArray: [5, 7],
            closed: true,
            segments: [
                [],
                [],
                [],
                []
            ]
        });
        rect.applyMatrix = false;
        this._g.idx = idx;
        this._g.root = root;
        this._g.willPt = c;
        this._g.willSeg = seg;
        this._g.rect = rect;

        this.pts.on("add-after", (_, seg) => {
            let c = new Circle({
                radius: 5,
                strokeColor: "red",
                fillColor: "#dedede",
                strokeScaling: false,
                data: {
                    type: "pen",
                    sub: "p",
                }
            });
            // c.activeStyle.strokeColor="white";
            // c.activeStyle.strokeWidth=10;
            c.applyMatrix = false;
            endPts.addChild(c);
            idx.ep.add(seg, c);
        }).on("rm-before", (_, seg) => {
            let c = idx.ep.get(seg);
            endPts.removeChildren(c.index, c.index + 1);
            idx.ep.rm(seg);
        }).on("clear-before", () => {
            endPts.removeChildren();
            idx.ep.clear();
        })

        this.seg.on("add-after", (_, seg) => {
            let pa = new paper.Path.Rectangle({
                size: [5, 5],
                strokeColor: "red",
                fillColor: "#dedede",
                strokeScaling: false,
                data: {
                    type: "pen",
                    sub: "cp",
                    end: "a",
                }
            });
            pa.rotate(45);
            let pb = pa.clone();
            let la = new Line({
                strokeColor: "red",
                strokeScaling: false,
                dashArray: [5, 7],
                data: {
                    type: "pen",
                    sub: "l",
                    end: "a",
                }
            });
            let lb = la.clone();
            pb.strokeColor = "blue";
            lb.strokeColor = "blue";
            pb.data.end = "b";
            lb.data.end = "b";
            pa.applyMatrix = false;
            pb.applyMatrix = false;
            la.applyMatrix = false;
            lb.applyMatrix = false;
            handles.addChildren([la, lb, pa, pb]);
            idx.cpa.add(seg, pa);
            idx.cpb.add(seg, pb);
            idx.la.add(seg, la);
            idx.lb.add(seg, lb);
        }).on("rm-before", (_, seg) => {
            if (me.seg.exist(seg)) {
                let pa = idx.cpa.get(seg),
                    pb = idx.cpb.get(seg),
                    la = idx.la.get(seg),
                    lb = idx.lb.get(seg);
                idx.cpa.rm(seg);
                idx.cpb.rm(seg);
                idx.la.rm(seg);
                idx.lb.rm(seg);
                handles.removeChildren(la.index, la.index + 1);
                handles.removeChildren(pa.index, pa.index + 1);
                handles.removeChildren(pb.index, pb.index + 1);
                handles.removeChildren(lb.index, lb.index + 1);
            }
        }).on("clear-before", () => {
            idx.cpa.clear();
            idx.cpb.clear();
            idx.la.clear();
            idx.lb.clear();
            handles.removeChildren();
        });

        view.addChildren(root, lopt.opr);
        root.addChild(rect);
        root.addChild(handles);
        root.addChild(c);
        root.addChild(endPts);
        root.addChild(seg);
    }
    _updateTipAllSegment() {
        let item = this.item;
        if (item) {
            this._g.endPts = [];
            item.segments.forEach((seg, i) => {
                let c = new Path.Circle({
                    radius: 5,
                    strokeColor: "blue",
                    position: seg,
                });
                this._g.endPts.push(c);
                this._g.endPts[i].position.set(seg.point);
            });
        }
    }
}