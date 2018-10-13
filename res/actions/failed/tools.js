class Tool {
    constructor(name, ins) {
        this.name = name;
        this.instance = ins;
    }
    onMe() {}
    offMe() {}
}

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
        this.hovered = null;
        this.operator = new Path.Operator();
        this.operator.strokeColor = "red";
        oprL.addChild(this.operator);
        this.selection = this.operator.selection;
        this.selection.on("add-after", (_, item) => {
            let ti = me.instance.tree.__.tii_ti.get(item);
            me.instance.tree.selection.appendOnce(ti);
        }).on("clear-before",()=>{
            me.instance.tree.selection.clear();
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
        this.fn = {
            _move: (e) => {
                if (me.state !== 0) return;
                let hitRet = hit([e.layerX, e.layerY]);
                let item = hitRet && hitRet.item;
                if (item) {
                    if (item.layer === me.instance.workspace.oprLayer) return;
                    if (me.hovered !== item) {
                        me.hovered && !me.selection.exist(me.hovered) &&
                            (me.hovered.selected = false);
                        item.selected = true;
                        let treeItem = this.instance.tree.__.tii_ti.get(item);
                        this.instance.tree.hover(treeItem);
                        me.hovered = item;
                    }
                } else {
                    if (me.hovered) {
                        if (!me.selection.exist(me.hovered))
                            me.hovered.selected = false;
                        me.hovered = null;
                        me.instance.tree.hover(null);
                    }
                }
            },
            _down: e => {
                if (e.which === 2) return;
                let hitRet = hit([e.layerX, e.layerY]);
                if (!hitRet || !hitRet.item || hitRet.item.layer === me.instance.workspace.oprLayer) {
                    let {
                        clientX,
                        clientY
                    } = e;
                    this._g.area.visible = true;
                    let bound = me.instance.workspace.dom.getBoundingClientRect();
                    let iP = me.instance.paper.view.
                    viewToProject(clientX - bound.left, clientY - bound.top);
                    let prevState = me.state;
                    let _move = (e) => {
                        me.state = 1;
                        let {
                            clientX,
                            clientY
                        } = e;
                        let p = me.instance.paper.view.
                        viewToProject(clientX - bound.left, clientY - bound.top);
                        this.shape.setSize(iP, p.subtract(iP));
                        this._updateSegments();
                        let items = paper.project.getItems({
                            overlapping: this.shape.toBounds(),
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
                        me.operator.selection.clear();
                        me.operator.selection.appendOnce(...items);
                    }
                    let _up = e => {
                        me.state = prevState;
                        this._g.area.visible=false;
                        removeEventListener("mousemove", _move);
                        removeEventListener("mouseup", _up);
                    }
                    addEventListener("mousemove", _move);
                    addEventListener("mouseup", _up);
                };
                // me.fn._opr(e);
            },
            _select: (e) => {
                let hitRet = hit([e.layerX, e.layerY]);
                if (!hitRet) {
                    me.selectedM = new Map();
                    me.operator.reset();
                    me.instance.tree.select();
                    return;
                };
                let item = hitRet.item;
                let loctIdx = hitRet.location && hitRet.location.index;
                if (!item) return;
                if (item.layer === me.instance.workspace.objectLayer) {
                    me.selectedM.set(item, item);
                    me.operator.select(item);
                    me.instance.tree.select({
                        one: me.instance.tree.__.tii_ti.get(item),
                    });
                }
            },
            _opr: (e) => {
                let hitRet = hit([e.layerX, e.layerY]);
                if (!hitRet) {
                    me.selectedM = new Map();
                    me.operator.reset();
                    me.instance.tree.select();
                    return;
                };
                let item = hitRet.item;
                let loctIdx = hitRet.location && hitRet.location.index;
                if (!item) return;
                if (item.layer === me.instance.workspace.objectLayer) {
                    me.selectedM.set(item, item);
                    me.operator.select(item);
                    me.instance.tree.select({
                        one: me.instance.tree.__.tii_ti.get(item),
                    });
                    // me.operator.setPivot(new Vec(240,277));
                    // let t=0;
                    // setInterval(() => {
                    //     me.operator.rotate(30);
                    //     me.operator.apply();
                    //     t++;
                    // }, 100)
                } else {
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
                    // iP = me.operator.globalToLocal(iP);
                    operator.save(iP);
                    let fn = operator[oprT];
                    if (me.selectedM.size === 1) {
                        me.selectedM.forEach((_, item) => {
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
                    }
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
Tool.Line = class extends Tool {
    constructor() {
        super("Line");
    }
}
Tool.Rect = class extends Tool {
    constructor() {
        super("Rect");
    }
}
Tool.MutiShape = class extends Tool {
    constructor() {
        super("MutiShape");
    }
}
Tool.Pen = class extends Tool {
    constructor() {
        super("Pen");
    }
}
Tool.Pencil = class extends Tool {
    constructor() {
        super("Pencil");
    }
}
Tool.Text = class extends Tool {
    constructor() {
        super("Text");
    }
}
Tool.Mirror = class extends Tool {
    constructor() {
        super("Mirror");
    }
}
Tool.Rotate = class extends Tool {
    constructor() {
        super("Rotate");
    }
}