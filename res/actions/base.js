// 图形元素的种类
let GTypes = {
    Point: "Point",
    Path: "Path",
    Group: "Group",
    Component: "Component",
    Instance: "Instance",
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