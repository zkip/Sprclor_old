{
    class Line extends Shape {
        constructor() {
            super();
            assign(this, {
                center: new Vec,
                a: new Vec,
                b: new Vec,
                radius: 0,
                angle: 0,
            });
            this.byCount(1);
            this.getByIdx(0).byCount(2);
        }
        setCenter() {
            let v = Vec.read(arguments);
            this.center.set(v);
            this.setRadius(this.radius);
            return this;
        }
        setRadius(r) {
            this.radius = r;
            let v = new Vec(this.radius, 0).rotate(this.angle);
            this._setCA(this.center.add(v));
            this._setCB(this.center.add(v.rotate(180)));
            this._update();
            return this;
        }
        setAngleByEnd(angle) {
            let av = new Vec(this.radius * 2, 0).rotate(angle || 0);
            this._setCA(av.add(this.b));
            this._updateAttrByAB();
            this._update();
            return this;
        }
        setAngle(a) {
            this.angle = a || 0;
            this.setRadius(this.radius);
            this._update();
            return this;
        }
        _setCA(v) {
            let frag = this.getByIdx(0);
            frag._setCtrl(0, v);
            this.a.set(v);
            return this;
        }
        _setCB(v) {
            let frag = this.getByIdx(0);
            frag._setCtrl(1, v);
            this.b.set(v);
            return this;
        }
        setCA(v) {
            this._setCA(v);
            this._updateAttrByAB();
            this._update();
            return this;
        }
        setCB(v) {
            this._setCB(v);
            this._updateAttrByAB();
            this._update();
            return this;
        }
        _updateAttrByAB() {
            let d = this.b.subtract(this.a);
            this.angle = d.angle;
            this.radius = d.length / 2;
            this.center.set(this.a.add(d.divide(2)));
            return this;
        }
        _update() {
            this.ev.execute("updated");
        }
    }
    Shape.Line = Line;
}