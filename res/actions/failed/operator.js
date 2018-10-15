Path.Operator = class extends Group {
    constructor() {
        super();
        let me = this;
        this._radius = new Vec();
        let {
            Circle,
            Rectangle,
            Line,
        } = paper.Path;
        this.strokeScaling = false;
        this.shape = new Shape.Rect();
        this.__temp = {
            matrix: new Matrix(),
            shape: new Shape.Rect(),
            startVec: new Vec(),
            iPivot: new Vec(),
            center: new Vec(),
        };
        this._g = {
            cornerScale: [],
            cornerRotate: [],
            pivotPoint: new Circle({
                radius: 10,
                strokeColor: "red",
                strokeScaling: false,
                data: {
                    type: "pivot",
                }
            }),
            boundry: new Path({
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
                    type: "sideScale",
                }
            }),
            centerPoint: new Group({
                strokeColor: "red",
                data: {
                    type: "center",
                }
            }),
            drag: new Path({
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
                    type: "drag",
                }
            }),
        };
        let cross = new Line({
            segments: [
                [-5, 0],
                [5, 0]
            ],
            strokeScaling: false,
        });
        this._g.centerPoint.addChild(cross);
        this._g.centerPoint.addChild(cross.clone().rotate(90));
        this.addChild(this._g.centerPoint);
        this.addChild(this._g.drag);
        this.addChild(this._g.boundry);
        this.addChild(this._g.pivotPoint);
        this._record = {
            bounds: null,
            pivot: new Vec(),
            vPivot: new Vec(),
        };
        this.selection = new SelectionEv().on("add-after", (_, item) => {
            item.selected = true;
            me._updateBounds();
            me.setPivotM();
            me._updateSegments();
            if (!me.visible) {
                me.visible = true;
            }
        }).on("rm-after", (_, item) => {
            item.selected = false;
            me._updateBounds();
            me.setPivotM();
            me._updateSegments();
            if (me.selection.len() === 0) {
                if (me.visible) {
                    me.visible = false;
                }
            }
        }).on("clear-before", () => {
            me.selection.forEach((_, item) => {
                item.selected = false;
            })
            me.reset();
        });
        for (let i = 0; i < 4; i++) {
            let rect = new Rectangle({
                size: [5, 5],
                fillColor: "#dedede",
                strokeScaling: false,
                data: {
                    index: i,
                    type: "cornerScale"
                }
            });
            let rect2 = rect.clone();
            rect2.scale(2);
            rect2.applyMatrix = true;
            rect2.data = {
                index: i,
                type: "cornerRotate"
            };
            this._g.cornerScale.push(rect);
            this._g.cornerRotate.push(rect2);
            this.addChild(rect2);
            this.addChild(rect);
        }
    }
    _updateBounds() {
        let b = null;
        this.selection.forEach((_, item) => {
            !b ? (b = item.bounds) : (b = b.unite(item.bounds));
        });
        if (b) {
            this._record.bounds = b;
        }
        return this;
    }
    save(vec) {
        this.__temp.startVec.set(vec);
        this.selection.forEach((_, item) => {
            item.applyMatrix = false;
        });
    }
    restore() {
        let me = this;
        if (this.selection.len() === 1) {
            this.selection.forEach((_, item) => {
                item.vPivot.set(me._record.pivot);
                let bounds = item.bounds;
                item.pivot.set(bounds.center.add(item.vPivot));
                item.applyMatrix = true;
            });
        }
        this.setPivotM();
        // if(){}
        // if (this.items.length === 1) {
        //     let item = this.items[0];
        //     item.applyMatrix = true;
        //     if (item.autoPivot) {
        //         // let bounds = item.bounds;
        //         // this.centerM.set(bounds.center.clone());
        //         // item.pivot.set(bounds.center.clone());
        //         // this.pivot.set(bounds.center.clone());
        //     } else {
        //         // let bounds = item.bounds;
        //         // let iPivot = this.__tempRecord.iPivot;
        //         // let pivot = bounds.center.add(iPivot);
        //         // this.setPivotM(pivot);
        //         // console.log(this.__tempRecord.iPivot);
        //         // this.setPivotM(this.__tempRecord.iPivot);
        //     }
        // } else {
        // }
        this._updateSegments();
    }
    reset() {
        this._record.bounds = new Bounds();
        this._updateBounds();
        this.setPivotM();
        this._updateSegments();
        this.visible = false;
        return this;
    }
    scaleByCorner(vec) {
        let {
            pivot
        } = this._record;
        let iVec = this.__temp.startVec.subtract(pivot);
        this.selection.forEach((_, item) => {
            let nVec = vec.subtract(pivot);
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
            item.scaling.set(retVec);
            item.pivot = pivot.clone();
            this._updateBounds();
            this._updateSegments();
        })
    }
    rotateByCorner(vec) {
        let {
            pivot
        } = this._record;
        let iVec = this.__temp.startVec.subtract(pivot);
        this.selection.forEach((_, item) => {
            let nVec = vec.subtract(pivot);
            item.rotation = iVec.getDirectedAngle(nVec);
            item.pivot = pivot.clone();
            this._updateBounds();
            this._updateSegments();
        });
    }
    scaleBySide(vec, cross) {
        let {
            pivot
        } = this._record;
        let iVec = this.__temp.startVec.subtract(pivot);
        this.selection.forEach((_, item) => {
            let nVec = vec.subtract(pivot);
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

            item.scaling.set(retVec);
            item.pivot = pivot.clone();
            this._updateBounds();
            this._updateSegments();
        })
    }
    drag(vec) {
        let {
            pivot
        } = this._record;
        let iVec = this.__temp.startVec;
        this.selection.forEach((_, item) => {
            let nVec = pivot.subtract(iVec);
            let pos = vec.add(nVec);
            item.position.set(pos);
            // item.pivot = pivot.clone;
            this._updateBounds();
            this._updateSegments();
        })
    }
    setPivotU(vec) {
        this.selection.forEach((_, item) => {
            item.autoPivot = false;
        });
        this.setPivotM(vec);
    }
    _updateSegments() {
        let _ = Path.Operator.__corner;
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
            this._g.cornerRotate[c].position.set(x + _[c][0] * 5, y + _[c][1] * 5);
        }
        this._g.pivotPoint.position.set(pivot);
        this._g.centerPoint.position.set(bounds.center);
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
        this.selection.forEach((_, item) => {
            item.pivot = pivot.clone();
        });
        this._g.pivotPoint.position.set(pivot);
        return this;
    }
    nextIdx() {
        return this.shape.nextIdx.apply(this, arguments);
    }
    prevIdx() {
        return this.shape.prevIdx.apply(this, arguments);
    }
}
Path.Operator.__corner = [
    [-1, -1],
    [-1, 1],
    [1, 1],
    [1, -1],
];