{
    class Rect extends Shape {
        constructor(a, b) {
            super(4);
            assign(this, {
                _sides: new Array(4),
                center: new Vec(),
                size: new Vec(),
                radius: new Vec(),
            })
            a && b && (this.fromTo(a, b));
        }
        setCenter(v) {
            this.center.set(v);
            this._updateByCenter();
            return this;
        }
        setSide(idx, side) {
            this._sides[idx] = side;
            this._updateBySide(idx);
            this._updateAttr();
            return this;
        }
        setSides(sides) {
            this._sides = sides;
            this._updateBySides();
            this._updateAttr();
            return this;
        }
        fromTo(a, b) {
            this.setSub(0, a);
            this.setSub(2, b);
            this._updateByFromTo();
            return this;
        }
        setRadius(v) {
            this.radius.set(v);
            this.size.set(this.radius.multiply(2));
            this._updateByCenter();
            return this;
        }
        setSize(size) {
            this.size.set(size);
            this.radius.set(size.divide(2));
            this._updateByCenter();
            return this;
        }
        setCorner(idx, v) {
            let start = idx * 2,
                _ = idx % 2 ? 0 : 1,
                ps = [v.x, v.y];
            this._vertex[start] = v.x;
            this._vertex[start + 1] = v.y;
            this._vertex[this.nextIdx(idx) * 2 + _] = ps[_];
            this._vertex[this.prevIdx(idx) * 2 + 1 - _] = ps[1 - _];
            this._updateAttr(idx);
            this._updateSideFromVertex();
            return this;
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
            return this._sides[idx];
        }
        getCenter() {
            return this.center;
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
            let [a] = this.getVertex(0),
                [b] = this.getVertex(2);
            let size = b.subtract(a);
            let radius = size.divide(2);
            this.center.set(a.add(radius));
            this.size.set(size);
            this.radius.set(radius);
            return this;
        }
        _updateByFromTo() {
            let [a] = this.getVertex(0),
                [b] = this.getVertex(2);
            this.setCorner(1, new Vec(b.x, a.y));
            this.setCorner(3, new Vec(a.x, b.y));
            this._updateAttr();
            this._updateSideFromVertex();
            return this;
        }
        _updateBySide(idx) {
            let start = idx * 2,
                _ = idx % 2 ? 0 : 1,
                _idx = start + _,
                side = this._sides[idx];
            let main = this.getSub("main");
            main[_idx] = side;
            main[this.nextIdx(idx) * 2 + _] = side;
            return this;
        }
        _updateByCenter() {
            let radius = this.radius;
            let center = this.center;
            // vertex
            this.setCorner(0, center.add(radius.multiply(-1)));
            this.setCorner(1, center.add(radius.multiply(1, -1)));
            this.setCorner(2, center.add(radius));
            this.setCorner(3, center.add(radius.multiply(-1, 1)));

            // sides
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
            let main = this.getSub("main");
            for (let i = 0; i < 4; i++) {
                let start = i * 6;
                this._sides[i] = main[start + (i % 2 ? 0 : 1)];
            }
            return this;
        }
    }
    Shape.Rect = Rect;
}