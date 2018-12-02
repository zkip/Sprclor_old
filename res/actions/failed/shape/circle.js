{
    class Circle extends Shape {
        constructor(center, radius) {
            super();
            this._vertex = [
                [],
                []
            ];
            this.center = new Vec();
            this.radius = 0;
            this.start = 0; // angle
            this.sweep = 360; // angle
            this.ratio = 1; // [0~1]
            this.outer = 0;
            this.inner = 0;
            center && this.setCenter(center);
            radius && this.setRadius(radius);
        }
        setRatio(r) {
            this.ratio = r;
            this._updateVertex(4);
            return this;
        }
        setStart(a) {
            this.start = a;
            this._updateVertex(4);
            return this;
        }
        setCenter(v) {
            this.center.set(v);
            this._updateVertex(4);
            return this;
        }
        setRadius(v) {
            this.radius = v;
            this._updateVertex(4);
            return this;
        }
        setSweep(w){
            this.sweep=w;
            this._updateVertex(4);
            return this;
        }
        isFull() {
            return !(this.sweep % 360) ? true : false;
        }
        isRatioed() {
            return this.ratio === 0 || this.ratio === 1 ? false : true;
        }
        clone() {
            let r = new Shape.Rect();
            r._vertex = this._vertex;
            r._updateSideFromVertex();
            return r;
        }
        getCenter() {
            return this.center;
        }
        getRadius() {
            return this.radius;
        }
        getRatio() {
            return this.ratio;
        }
        _updateAttr(idx) {
            let a = this.getVertex(0),
                b = this.getVertex(2);
            let size = b.subtract(a);
            let radius = size.divide(2);
            this.center.set(a.add(radius));
            this.size.set(size);
            this.radius.set(radius);
            return this;
        }
        _updateByFromTo() {
            let a = this.getVertex(0),
                b = this.getVertex(2);
            this.setCorner(1, new Vec(b.x, a.y));
            this.setCorner(3, new Vec(a.x, b.y));
            this._updateAttr();
            this._updateSideFromVertex();
            return this;
        }
        _updateVertex(n) {
            let _ = this.sweep;
            let vv = _ % 360;
            !vv && (vv = 360);
            let v = (4 / 3) * Math.tan(Math.PI / (2 * n));
            v *= (vv / 360);
            let outer = [],
                inner = [];
            this._vertex = [outer, inner];
            let center = this.center,
                radius = this.radius;
            let r = new Vec(radius, 0).rotate(this.start);
            let na = vv / n;
            let max = n + (vv === 360 ? 0 : 1);
            for (let i = 0; i < max; i++) {
                let p = new Vec(),
                    hi = new Vec(),
                    ho = new Vec();
                let cr = r.rotate(na * i);
                p.set(center.add(cr));
                if (i !== 0 || vv === 360) {
                    hi.set(cr.multiply(v).rotate(-90));
                }
                if (i !== max - 1 || vv === 360) {
                    ho.set(cr.multiply(v).rotate(90));
                }
                outer.push(p.x, p.y, hi.x, hi.y, ho.x, ho.y);
                if (this.isRatioed()) {
                    p.set(center.add(cr.multiply(this.ratio)));
                    hi = hi.multiply(this.ratio);
                    ho = ho.multiply(this.ratio);
                    inner.unshift(p.x, p.y, ho.x, ho.y, hi.x, hi.y);
                }
            }
            if (!this.isFull()) {
                outer.push(...inner);
                this._vertex[1] = [];
            }
        }
    }
    Shape.Circle = Circle;
}