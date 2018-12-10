{
    let _type = {
        Normal: "Normal",
        Pie: "Pie",
        Arc: "Arc",
        CRing: "CRing",
        Ring: "Ring",
    };
    let _segCount = {
        Normal: n => [n, 0],
        Pie: n => [n + 2, 0],
        Arc: n => [n + 1, 0],
        CRing: n => [2 * (n + 1), 0],
        Ring: n => [n, n],
    }
    let alignFrag = (me) => {
        let sgm = me.segmention;
        let f = _segCount[me.getSpecType()];
        let segc = f(sgm);
        let c = 1;
        if (segc[1] !== 0) {
            c++;
        }
        if (me.len() === c) return;
        me.byCount(c);
    }
    class Circle extends Shape {
        constructor(center, radius) {
            super();
            assign(this, {
                radius: 0,
                start: 0,
                sweep: 360,
                ratio: 0,
                segmention: 4,

                autoComputed: true,

                _normalizeAngle: 0,
            })
            this.setRadius(radius);
            this.setSegmention(this.segmention);
        }
        setRatio(r) {
            if (r >= 0) {
                this.ratio = r;
                this._update();
            }
            return this;
        }
        setStart(a) {
            this.start = a;
            this._update();
            return this;
        }
        setRadius(v) {
            this.radius = v;
            this._update();
            return this;
        }
        setSweep(w) {
            this.sweep = w;
            this._update();
            return this;
        }
        setSegmention(n) {
            if (n > 0) {
                this.segmention = n;
                this._normalizeAngle = (4 / 3) * Math.tan(Math.PI / (2 * n));
                this._update();
            }
            return this;
        }
        isFull() {
            return !(this.sweep % 360) ? true : false;
        }
        getSpecType() {
            let f = this.isFull() ? 1 : 0,
                r = this.ratio,
                sum = f + r;
            if (sum === 2 || (f === 1 && r === 0)) {
                // 圆
                return _type.Normal;
            } else if (sum === 0) {
                // 饼
                return _type.Pie;
            } else {
                if (f === 1) {
                    // 环
                    return _type.Ring;
                } else if (r === 1) {
                    // 弧或弓
                    return _type.Arc;
                } else {
                    // C形环
                    return _type.CRing;
                }
            }
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
        _update() {
            alignFrag(this);
            let me = this;
            let main = this.getByIdx(0);
            let sub = this.getByIdx(1);
            main.vertex = [];
            sub && (sub.vertex = []);
            let t = this.getSpecType();
            let vv = this.sweep % 360;
            !vv && (vv = 360);
            let pa = this._normalizeAngle * (vv / 360);
            let sgm = this.segmention;

            let radius = this.radius;
            let r = new Vec(radius, 0).rotate(this.start);
            let na = vv / sgm;
            let max = sgm + (vv === 360 ? 0 : 1);

            if (t === _type.Pie) {
                main.vertex.push(0, 0, 0, 0, 0, 0);
            }
            for (let i = 0; i < max; i++) {
                let p = new Vec(),
                    hi = new Vec(),
                    ho = new Vec();
                let cr = r.rotate(na * i);
                p.set(cr);
                if (i !== 0 || vv === 360) {
                    hi.set(cr.multiply(pa).rotate(-90));
                }
                if (i !== max - 1 || vv === 360) {
                    ho.set(cr.multiply(pa).rotate(90));
                }
                main.vertex.push(p.x, p.y, hi.x + p.x, hi.y + p.y, ho.x + p.x, ho.y + p.y);
                if (t === _type.Ring || t === _type.CRing) {
                    p.set(cr.multiply(this.ratio));
                    hi = hi.multiply(this.ratio);
                    ho = ho.multiply(this.ratio);
                    if (t === "Ring") {
                        sub.vertex.push(p.x, p.y, hi.x + p.x, hi.y + p.y, ho.x + p.x, ho.y + p.y);
                    } else {
                        main.vertex.unshift(p.x, p.y, ho.x + p.x, ho.y + p.y, hi.x + p.x, hi.y + p.y);
                    }
                }
            }
            this.vertex = [main.vertex];
            sub && this.vertex.push(sub.vertex);
            this.ev.execute("updated");
            return this;
        }
    }
    Circle.SpecType = _type;
    Shape.Circle = Circle;
}