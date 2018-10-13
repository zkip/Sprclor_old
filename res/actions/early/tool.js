class ToolBox extends Base {
    constructor() {
        super();
        // 
    }
    addTool() {}
    init() {}
}

class Tool extends Base {
    constructor(type, ins) {
        super();
        this.type = type;
        this.ins = ins;
    }
}

class Picker extends Tool {
    constructor(ins) {
        super("Picker", ins);
        this.activeItem = null;
    }
    onMe() {}
}
Tool.Picker = Picker;

/* 钢笔工具
    [点]
    + +/-点
    + +/-点约束
    [线段]
    + +/-连接

    [区域]
    + 存储区域
*/
class Pen extends Tool {
    // Path:
    constructor() {
        super("Pen", ins);
        this.ins = ins;
    }
    onMe() {
        let {
            selection,
            data,
        } = ins;
        let curPath = selection.getFirst("path", "cur");
        let lastPoint = null;
        this.view.get("workspace").addEventListener("mousedown", e => {
            curPath = new Path();
            data.add(curPath);
            selection.rm("path", "cur");
            selection.add(curPath, "path", "cur");
            let ep = Point.fromEventObj(e);
            let offsetV = new Vector();
            let lastSegType = 0;
            let downEO = e;
            let seg;
            curPath.addPoint(ep);
            let _1 = e => {
                let cp = Point.fromEventObj(e);
                offsetV.set(Point.toVectorBy2P(ep, cp));
                let nOffsetV = offsetV.negative();
                if (offsetV.len() < 5) {
                    if (lastSegType === 1) {
                        seg = new Segment.Line();
                        lastSegType = 0;
                    }
                } else {
                    if (lastSegType === 0) {
                        seg = new Segment.Curve.Bezier3();
                        lastSegType = 1;
                    }
                    let AHandler = Point.toVectorBy2P(ep, lastPoint).add(nOffsetV);
                    seg.handler(AHandler, nOffsetV);
                }
            }
            let _2 = e => {
                curPath.link(lastPoint, ep, seg);
                lastPoint = ep;
                if (!seg) _1(downEO);
                removeEventListener("mousemove", _1);
                removeEventListener("mouseup", _2);
            }
            addEventListener("mousemove", _1);
            addEventListener("mouseup", _2);
        });
    }
}
Tool.Pen = Pen;

// 铅笔工具
class Pencil extends Tool {
    constructor() {
        super("Pencil");
    }
}
Tool.Pencil = Pencil;

class Alignment extends Tool {
    constructor() {
        super("Alignment");
    }
}
Tool.Alignment = Alignment;

// 提供建议值
class Capture extends Tool {
    constructor() {
        super("Capture");
    }
}
Tool.Capture = Capture;