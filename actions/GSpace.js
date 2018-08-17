class GSpace {
    constructor() {
        this.stor = new Loki();
        this.stor.addCollection(GTypes.Point);
        this.stor.addCollection(GTypes.Line);
        this.stor.addCollection(GTypes.Face);
        this.stor.addCollection(GTypes.Camera);
    }
    // 添加图形对象到图形空间中
    add(g) {
        this.stor.getCollection(g.getType()).insert(g);
    }
    get(tp, id) {
        return this.stor.getCollection(tp).find({ ID: id });
    }
    // 从图形空间中删除
    rm(tp, id) {
        this.stor.getCollection(tp).remove({ ID: id });
    }
    getPoint(pos, near) {
        let ret = this.stor.getCollection("Point").where((p) => {
            return getDistance(pos, p) <= near;
        }).sort((a, b) => {
            return getDistance(pos, a) - getDistance(pos, b);
        });
        return ret;
    }
    getLine() {
    }
}
let gs = new GSpace();
let p = new Point(10, 10);
// gs.add(p);
console.log(gs.getPoint({ x: 0, y: 0 }, 0));
