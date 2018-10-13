// 图形元素的种类
let GTypes = {
    Point: "Point",
    Path: "Path",
    Camera: "Camera",
    Group: "Group",
    Component: "Component",
    Instance: "Instance",
    Constraint: "Constraint",
    Modifier: "Modifier",
    Filter: "Filter",
}
let GTimes = 0;
class Base {
    constructor(GTypes) {
        this.GType = GTypes;
        this.ID = (new Date()).getTime() + "" + GTimes;
        GTimes++;
    }
    getType() {
        return this.GType;
    }
}

class Obvable extends Base {
    constructor(GTypes) {
        super(GTypes);
        this.position = new Vec();
        this.rotation = 0;
        this.scaling = new Vec(1, 1);
    }
}

class Point extends Obvable {
    constructor(x, y) {
        super(GTypes.Point);
        this.move(x, y);
    }
    move(x, y) {
        this.x = x;
        this.y = y;
        this.position.set(x, y);
    }
}

class Path extends Obvable {
    constructor() {
        super(GTypes.Path);
        this.content = [];        // [][Path.CmdList,...arg]
    }
}

Path.CmdList = {
    M: 0x0,             // MoveTo
    L: 0x1,             // LineTo
    B: 0x2,             // BezierCurveTo
    S: 0x3,             // SplineCurveTo(Nurbs Curve)
    Z: 0x4,             // ClosePath
}

class Camera extends Obvable {
    constructor() {
        super("Camera");
        assign({
            viewport: {
                width: 0,
                height: 0,
                scaling: 1,
            },
            data: [],
            sty: [],
        })
    }
    setGSpace(gs){
        this.gs=gs;
    }
}
class Group extends Obvable {
    constructor() {
        super("Group");
    }
}
class Instance extends Obvable {
    constructor() {
        super("Instance");
    }
}
class Component extends Base {
    constructor() {
        super("Component");
    }
}
class Constraint extends Base {
    constructor() {
        super("Constraint");
    }
}
class Modifier extends Base {
    constructor() {
        super("Modifier");
    }
}
class Filter extends Base {
    constructor() {
        super("Filter");
    }
}
