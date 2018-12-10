{
    class Rect extends Shape {
        constructor(radius) {
            super();
            assign(this, {
                sides: new Array(4),
                size: new Vec,
                radius: new Vec,
                center: new Vec,
            });
            this.byCount(1);
            this.getByIdx(0).byCount(4);
            radius && this.setRadius(radius);
        }
        setSide(idx, side) {
            this.sides[idx] = side;
            this._updateBySide(idx);
            this._updateAttr();
            this._update();
            return this;
        }
        setSides(sides) {
            this.sides = sides;
            this._updateBySides();
            this._updateAttr();
            this._update();
            return this;
        }
        fromTo(a, b) {
            this._setCorner(0, a);
            this._setCorner(2, b);
            this._updateByFromTo();
            this._update();
            return this;
        }
        setRadius(v) {
            this.radius.set(v);
            this.size.set(this.radius.multiply(2));
            this._updateByRadius();
            this._update();
            return this;
        }
        setSize(size) {
            this.size.set(size);
            this.radius.set(size.divide(2));
            this._updateByRadius();
            this._update();
            return this;
        }
        _setCorner(idx, v) {
            let start = idx * 2,
                _ = idx % 2 ? 0 : 1,
                cr = ["x", "y"],
                ps = [v.x, v.y];
            let frag = this.getByIdx(0);
            frag._setCtrl(idx, v);
            frag._setCtrl(frag.nextIdx(idx), {
                [cr[_]]: ps[_]
            });
            frag._setCtrl(frag.prevIdx(idx), {
                [cr[1 - _]]: ps[1 - _]
            });
        }
        setCorner(idx, v) {
            this._setCorner(idx, v);
            this._updateAttr(idx);
            this._updateSideFromVertex();
            this._update();
            return this;
        }
        getCorner(idx){
            return this.getByIdx(0).getEnd(idx);
        }
        nextIdx(idx) {
            return idx + 1 > 3 ? 0 : idx + 1;
        }
        prevIdx(idx) {
            return idx - 1 < 0 ? 3 : idx - 1;
        }
        clone() {
            let r = new Shape.Rect();
            r._vertex = this._vertex;
            r._updateSideFromVertex();
            return r;
        }
        toBounds() {
            return new Bounds(this.getVertex(0), this.getVertex(2));
        }
        getSide(idx) {
            return this.sides[idx];
        }
        getSize() {
            return this.size;
        }
        getWidth() {
            return this.width;
        }
        getHeight() {
            return this.height;
        }
        getRadius() {
            return this.radius;
        }
        _updateAttr(idx) {
            let frag = this.getByIdx(0),
                a = frag.getEnd(0),
                b = frag.getEnd(2);
            let size = b.subtract(a);
            let radius = size.divide(2);
            this.size.set(size);
            this.radius.set(radius);
            return this;
        }
        _updateBySide(idx) {
            let start = idx * 2,
                _ = idx % 2 ? 0 : 1,
                cr = ["x", "y"],
                side = this.sides[idx];
            let frag = this.getByIdx(0);
            frag._setCtrl(idx, {
                [cr[_]]: side
            });
            frag._setCtrl(this.nextIdx(idx), {
                [cr[_]]: side
            });
            return this;
        }
        _updateByRadius() {
            let radius = this.radius;
            this._setCorner(0, radius.multiply(-1));
            this._setCorner(1, radius.multiply(1, -1));
            this._setCorner(2, radius);
            this._setCorner(3, radius.multiply(-1, 1));

            // sides
            this._updateSideFromVertex();
            return this;
        }
        _updateByFromTo() {
            let frag = this.getByIdx(0);
            let a = frag.getEnd(0),
                b = frag.getEnd(2);
            let size = b.subtract(a),
                radius = size.divide(2);
            this.size.set(size);
            this.radius.set(radius);
            this._updateSideFromVertex();
            return this;
        }
        _updateBySides() {
            for (let i = 0; i < 4; i++) {
                this._updateBySide(i);
            }
            return this;
        }
        _updateSideFromVertex() {
            let frag = this.getByIdx(0);
            for (let i = 0; i < 4; i++) {
                let v = frag.getEnd(i);
                this.sides[i] = v[(i % 2 ? "x" : "y")];
            }
            return this;
        }
        _update() {
            this.getByIdx(0)._update();
        }
    }
    Shape.Rect = Rect;
}