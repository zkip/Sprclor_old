{
    class Operator extends Inster {
        constructor() {
            super("Operator");
            let me = this;
            this._radius = new Vec();
            this.shape = new Shape.Rect();
            this._g = {};
            this._record = {
                bounds: new Bounds(),
                pivot: new Vec(),
                autoPivot: true,
                matrixes: new Map(), // 操作前对象们的matrix
                vPivot: new Vec(),
                shape: new Shape.Rect(),
                startVec: new Vec(),
                endVec: new Vec(),
            };
            this.__temp = {
                matrix: new Matrix(),
                shape: new Shape.Rect(),
                startVec: new Vec(),
                iPivot: new Vec(),
                center: new Vec(),
            };
            this.items = new SelectionEv().on("add-after", (_, item) => {
                if (item.activeStyle) {
                    item._backupStyle = item.style.clone();
                    item.style.set(item.activeStyle);
                }
                me._updateBounds();
                if (me._record.autoPivot) {
                    me.setPivotM();
                }
                me._updateSegments();
                if (!me._g.root.visible) {
                    me._g.root.visible = true;
                }
                if (me.items.len() === 1) {
                    me.items.forEach((_, item) => {
                        item.autoPivot ? me.setPivotM() : me.setPivotM(item.bounds.center.add(item.vPivot));
                    })
                } else {
                    me._record.autoPivot = true;
                    if (this._record.autoPivot) {
                        this.setPivotM();
                    }
                }
            }).on("rm-after", (_, item) => {
                if (item.activeStyle) {
                    item.style.set(item._backupStyle);
                }
                me._updateBounds();
                if (me._record.autoPivot) {
                    me.setPivotM();
                }
                me._updateSegments();
                if (me.items.len() === 0) {
                    if (me._g.root.visible) {
                        me._g.root.visible = false;
                    }
                }
            }).on("clear-before", () => {
                me.reset();
                me.items.forEach((_, item) => {
                    if (item.activeStyle) {
                        item.style.set(item._backupStyle);
                    }
                })
            });
        }
        init() {
            this._initG();
            return this;
        }
        record(opt) {
            let me = this;
            let {
                startVec,
                endVec
            } = opt || {};
            startVec && this._record.startVec.set(startVec);
            endVec && this._record.endVec.set(endVec);
            return this;
        }
        save() {
            let me = this;
            this.items.forEach((_, item) => {
                item.applyMatrix = false;
                me._record.matrixes.set(item, item.matrix.clone());
            });
            return this;
        }
        restore() {
            let me = this;
            me._record.matrixes = new Map();
            me._record.startVec = new Vec();
            me._record.endVec = new Vec();
            if (me.items.len() === 1) {
                me.items.forEach((_, item) => {
                    item.autoPivot ? me.setPivotM() : me.setPivotM(item.bounds.center.add(item.vPivot));
                })
            } else {
                if (this._record.autoPivot) {
                    this.setPivotM();
                }
            }
        }
        reset() {
            this._record.bounds = new Bounds();
            this._updateBounds();
            if (this._record.autoPivot) {
                this.setPivotM();
            }
            this._updateSegments();
            this._g.root.visible = false;
            return this;
        }
        scaleByCorner() {
            let {
                pivot
            } = this._record;
            let me = this;
            let iVec = this._record.startVec.subtract(pivot);
            let endVec = this._record.endVec;
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
                } else if (x === 0 && y === 0) {} else {
                    retVec.set(nVec.divide(x + y));
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
            });
        }
        rotateByCorner() {
            let {
                pivot
            } = this._record;
            let me = this;
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
        scaleBySide(cross) {
            let {
                pivot
            } = this._record;
            let me = this;
            let iVec = this._record.startVec.subtract(pivot);
            let endVec = this._record.endVec;
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
        drag() {
            let {
                pivot
            } = this._record;
            let me = this;
            let iVec = this.__temp.startVec;
            let mVec = this._record.endVec.subtract(this._record.startVec);
            this.items.forEach((_, item) => {
                let om = me._record.matrixes.get(item);
                if (!om) return;
                let m = new Matrix();
                m.translate(mVec);
                item.matrix = om.prepended(m);
                this._updateBounds();
                this._updateSegments();
            })
        }
        setPivotU() {
            let vec = this._record.endVec;
            this._record.autoPivot = false;
            let {
                pivot,
                bounds
            } = this._record;
            if (this.items.len() === 1) {
                this.items.forEach((_, item) => {
                    item.vPivot.set(pivot.subtract(bounds.center));
                })
            }
            this.setPivotM(vec);
        }
        /* boundry position flag
            -1,-1 0,-1 1,-1
            -1,0  0,0  1,0
            -1,1  0,1  1,1
        */
        // Point/number/(left,top *boundry position flag*)/nil :
        setPivotM() {
            let me = this;
            let {
                pivot,
                vPivot,
                bounds
            } = this._record;
            // center
            if (arguments.length === 0) {
                pivot.set(bounds.center);
            } else if (arguments.length === 2) {
                let l = arguments[0],
                    t = arguments[1],
                    x, y;
                if (l === -1) {
                    x = this.shape._vertex[0];
                } else if (l === 0) {
                    let w = this.shape._vertex[4] - this.shape._vertex[0];
                    x = this.shape._vertex[0] + w / 2;
                } else if (l === 1) {
                    x = this.shape._vertex[4];
                }
                if (t === -1) {
                    y = this.shape._vertex[1];
                } else if (t === 0) {
                    let h = this.shape._vertex[5] - this.shape._vertex[1];
                    y = this.shape._vertex[1] + h / 2;
                } else if (t === 1) {
                    y = this.shape._vertex[5];
                }
                pivot.set(new Vec(x, y));
            } else if (arguments[0] instanceof Vec) {
                // point
                pivot.set(arguments[0]);
            } else if (typeof arguments[0] === "number") {
                // corner index
                let idx = arguments[0];
                let x = this.shape._vertex[idx * 2],
                    y = this.shape._vertex[idx * 2 + 1];
                pivot.set(new Vec(x, y));
            }
            vPivot.set(pivot.subtract(bounds.center));
            this._updatePivot();
            return this;
        }
        nextIdx() {
            return this.shape.nextIdx.apply(this, arguments);
        }
        prevIdx() {
            return this.shape.prevIdx.apply(this, arguments);
        }
        _initG() {
            let me = this;
            let ins = this.getIns();
            let {
                Rectangle,
                Line,
            } = paper.Path;
            let _ = Tool.Operator.__corner;
            let root = new Group();
            root.strokeScaling = false;
            root.strokeColor = "red";
            this._g.root = root;
            this._g.cornerScale = [];
            this._g.cornerRotate = [];
            this._g.pivotPoint = new Circle({
                radius: 10,
                strokeColor: "red",
                strokeScaling: false,
                data: {
                    type: "operator",
                    sub: "pivot",
                }
            });
            this._g.boundry = new Path({
                segments: [
                    [],
                    [],
                    [],
                    []
                ],
                strokeColor: "red",
                strokeScaling: false,
                dashArray: [4, 10],
                closed: true,
                data: {
                    type: "operator",
                    sub: "sideScale",
                }
            });
            this._g.centerPoint = new Group({
                strokeColor: "red",
                data: {
                    type: "operator",
                    sub: "center",
                }
            });
            this._g.drag = new Path({
                segments: [
                    [],
                    [],
                    [],
                    []
                ],
                fillColor: "rgba(0,0,0,0.5)",
                opacity: 0,
                strokeScaling: false,
                dashArray: [4, 10],
                closed: true,
                data: {
                    type: "operator",
                    sub: "drag",
                }
            });
            let cross = new Line({
                segments: [
                    [-5, 0],
                    [5, 0]
                ],
                strokeColor: "red",
                strokeScaling: false,
            });
            this._g.centerPoint.addChild(cross);
            this._g.centerPoint.addChild(cross.clone().rotate(90));
            this._g.centerPoint.rotate(45);
            this._g.centerPoint.applyMatrix = false;
            root.addChild(this._g.centerPoint);
            root.addChild(this._g.drag);
            root.addChild(this._g.boundry);
            root.addChild(this._g.pivotPoint);
            let view = ins.ui.get("view");
            view.addChildren(root, UI.View.lopt.opr);
            view.mEvent.add("viewScaling", (s) => {
                me._g.centerPoint.applyMatrix = false;
                me._g.pivotPoint.applyMatrix = false;
                me._g.centerPoint.scaling.set(1 / s, 1 / s);
                me._g.pivotPoint.scaling.set(1 / s, 1 / s);
                me._g.cornerRotate.forEach((g, c) => {
                    let x = me.shape._vertex[c * 2],
                        y = me.shape._vertex[c * 2 + 1];
                    g.position.set(x + _[c][0] * 15 / s, y + _[c][1] * 15 / s);
                    g.applyMatrix = false;
                    g.scaling.set(1 / s, 1 / s);
                });
                me._g.cornerScale.forEach(g => {
                    g.applyMatrix = false;
                    g.scaling.set(1 / s, 1 / s);
                });
            })
            for (let i = 0; i < 4; i++) {
                let rect = new Rectangle({
                    size: [5, 5],
                    fillColor: "#dedede",
                    strokeScaling: false,
                    data: {
                        index: i,
                        type: "operator",
                        sub: "cornerScale"
                    }
                });
                let rect2 = rect.clone();
                rect2.scale(2);
                rect2.applyMatrix = true;
                rect2.data = {
                    index: i,
                    type: "operator",
                    sub: "cornerRotate",
                };
                this._g.cornerScale.push(rect);
                this._g.cornerRotate.push(rect2);
                root.addChild(rect2);
                root.addChild(rect);
            }
        }
        _updatePivot() {
            this._g.pivotPoint.position.set(this._record.pivot);
        }
        _updateBounds() {
            let b = null;
            this.items.forEach((_, item) => {
                !b ? (b = item.bounds) : (b = b.unite(item.bounds));
            });
            if (b) {
                this._record.bounds = b;
            }
            return this;
        }
        _updateSegments() {
            let _ = Tool.Operator.__corner;
            let {
                bounds,
                pivot
            } = this._record;
            this.shape.setSize(bounds.topLeft, bounds.bottomRight.subtract(bounds.topLeft));
            for (let i = 0; i < 8; i += 2) {
                let x = this.shape._vertex[i],
                    y = this.shape._vertex[i + 1];
                let c = i / 2 >> 0;
                this._g.boundry.segments[c].point.set(x, y);
                this._g.drag.segments[c].point.set(x, y);
                this._g.cornerScale[c].position.set(x, y);
                this._g.cornerRotate[c].position.set(x + _[c][0] * 15, y + _[c][1] * 15);
            }
            this._g.pivotPoint.position.set(pivot);
            this._g.centerPoint.position.set(bounds.center);
        }
    }
    Operator.__corner = [
        [-1, -1],
        [-1, 1],
        [1, 1],
        [1, -1],
    ];
    Tool.Operator = Operator;
}