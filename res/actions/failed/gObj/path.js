delete paper.CompoundPath.prototype._hitTestChildren;
class Path extends paper.CompoundPath {
    constructor(frag) {
        super();
        assign(this, new GObj(this));
        assign(this, {
            bfVertex: new Map(),
        });
        // this.matrix只用来控制坐标和旋转角度作为base，this.coordMatrix为坐标空间变换
        this.applyMatrix = false;
        frag && this.addChild(frag);
    }
    setPivot(v) {
        this.mPivot.set(v);
    }
    getPivot() {
        return this.mPivot;
    }
    _recordVertex() {
        this.children.forEach(v => this.bfVertex.set(v, v.vertex.clone()));
        return this;
    }
    addChild(frag) {
        paper.CompoundPath.prototype.addChild.call(this, frag);
        this._recordVertex();
        return this;
    }
    smooth(opt) {
        let me = this;
        this.children.forEach(v => {
            v.smooth(opt);
            me.bfVertex.set(v, v.vertex);
        });
        return this;
    }
    applyCoordMatrix() {
        let me = this;
        this.autoComputed = false;
        this.children.forEach(v => {
            me.bfVertex.set(v, v.vertex.clone());
        });
        this.coordMatrix.reset();
        return this;
    }
    flatten() {
        let rotation = this.rotation;
        let m = new Matrix();
        m.rotate(m.bounds.center);
        this.coordMatrix.append(m);
        this.applyCoordMatrix();
        this.rotation = 0;
        return this;
    }
    _updateSegments() {
        let me = this;
        this.children.forEach(v => {
            let bfVertex = this.bfVertex.get(v);
            v.vertex = [];
            if (me.canBreak) {
                me.mp.getGlobal()._transformCoordinates(bfVertex, v.vertex, v.segments.length * 3 >> 0);
            } else {
                v.vertex = bfVertex;
            }
            v._updateSegments();
        })
        return this;
    }
}
assign(Path, GObj, "extend");