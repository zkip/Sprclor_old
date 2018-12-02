class Line extends Path {
    constructor(a, b) {
        super(new Fragment({
            segments: [
                [],
                []
            ],
        }));
        assign(this, {
            center: new Vec,
            a: new Vec,
            b: new Vec,
            radius: 0,
            angle: 0,
        });
        a && this.setA(a);
        b && this.setB(b);
    }
    setRadius(r) {
        this.radius = r;
        let v = new Vec(this.radius, 0).rotate(this.angle);
        this._setA(this.center.add(v));
        this._setB(this.center.add(v.rotate(180)));
        this._updateSegments();
        return this;
    }
    setCenter(v) {
        this.center.set(v);
        this.setRadius(this.radius);
        return this;
    }
    setAngleByEnd(angle) {
        let av = new Vec(this.radius * 2, 0).rotate(angle || 0);
        this._setA(av.add(this.b));
        this._updateAttrByAB();
        return this;
    }
    setAngle(a) {
        this.angle = a || 0;
        this.setRadius(this.radius);
        return this;
    }
    _setA(v) {
        let vs = this.bfVertex.get(this.children[0]);
        vs[0] = v.x;
        vs[1] = v.y;
        vs[2] = v.x;
        vs[3] = v.y;
        vs[4] = v.x;
        vs[5] = v.y;
        this.a.set(v);
        this._updateSegments();
        return this;
    }
    _setB(v) {
        let vs = this.bfVertex.get(this.children[0]);
        vs[6 + 0] = v.x;
        vs[6 + 1] = v.y;
        vs[6 + 2] = v.x;
        vs[6 + 3] = v.y;
        vs[6 + 4] = v.x;
        vs[6 + 5] = v.y;
        this.b.set(v);
        this._updateSegments();
        return this;
    }
    setA(v) {
        this._setA(v);
        this._updateAttrByAB();
        return this;
    }
    setB(v) {
        this._setB(v);
        this._updateAttrByAB();
        return this;
    }
    _updateAttrByAB() {
        let d = this.b.subtract(this.a);
        this.angle = d.angle;
        this.center.set(this.a.add(d.divide(2)));
        this.radius = d.length / 2;
        return this;
    }
}
Path.Line = Line;