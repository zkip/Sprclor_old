// 图形元素的种类
let GTypes={
    Point: "Point",
    Line: "Line",
    Face: "Face",
    Camera: "Camera",
    Group: "Group",
    Component: "Component",
    Instance: "Instance",
    Constraint: "Constraint",
    Modifier: "Modifier",
    Filter: "Filter",
}
let GTimes = 0;
class G {
    constructor(GTypes) {
        this.GType = GTypes;
        this.ID = (new Date()).getTime() + "" + GTimes;
        GTimes++;
    }
    getType() {
        return this.GType;
    }
}
class Point extends G {
    constructor(x, y) {
        super(GTypes.Point);
        this.x = x;
        this.y = y;
    }
}
class Line extends G {
    constructor() {
        super(GTypes.Line);
    }
}
class Face extends G {
    constructor() {
        super("Face");
    }
}
class Camera extends G {
    constructor() {
        super("Camera");
    }
}
class Group extends G {
    constructor() {
        super("Group");
    }
}
class Component extends G {
    constructor() {
        super("Component");
    }
}
class Instance extends G {
    constructor() {
        super("Instance");
    }
}
class Constraint extends G {
    constructor() {
        super("Constraint");
    }
}
class Modifier extends G {
    constructor() {
        super("Modifier");
    }
}
class Filter extends G {
    constructor() {
        super("Filter");
    }
}
