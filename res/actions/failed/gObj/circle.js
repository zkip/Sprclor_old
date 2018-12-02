let Circle; {
    let _type = GenConst(
        "Normal",
        "Pie",
        "Arc",
        "CRing",
        "Ring",
    );
    let _segCount = {
        [_type.Normal]: n => [n, 0],
        [_type.Pie]: n => [n + 2, 0],
        [_type.Arc]: n => [n + 1, 0],
        [_type.CRing]: n => [2 * (n + 1), 0],
        [_type.Ring]: n => [n, n],
    }
    Circle = class extends Path {
        constructor(center, radius) {
            super(new Fragment({
                closed: true
            }));
            assign(this, {
                center: new Vec,
                radius: 0,
                start: 0,
                sweep: 360,
                ratio: 0,
                segmention: 4,
                closeCap: false,

                autoComputed: true,

                _normalizeAngle: 0,
            })
            this.setSegmention(this.segmention);
            center && this.setCenter(center);
            radius && this.setRadius(radius);
            this._updateVertex();
        }
        setRatio(r) {
            this.ratio = r;
            this._updateVertex();
            return this;
        }
        setStart(a) {
            this.start = a;
            this._updateVertex();
            return this;
        }
        setCenter(v) {
            this.center.set(v);
            this._updateVertex();
            return this;
        }
        setRadius(v) {
            this.radius = v;
            this._updateVertex();
            return this;
        }
        setSweep(w) {
            this.sweep = w;
            this._updateVertex();
            return this;
        }
        setSegmention(n) {
            this.segmention = n;
            this._normalizeAngle = (4 / 3) * Math.tan(Math.PI / (2 * n));
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
        // 准备Fragment
        _genSegs() {
            let sgm = this.segmention;
            let f = _segCount[this.getSpecType()];
            let segc = f(sgm);
            for (let i = 0; i < 2; i++) {
                let c = segc[i];
                if (c === 0) {
                    this.removeChildren(i, i + 1);
                    continue;
                }
                let frag = this.children[i];
                if (!frag) {
                    frag = new Fragment({
                        closed: true
                    });
                    this.addChild(frag);
                }
                let len = frag.segments.length;
                let d = c - len;
                if (d > 0) {
                    for (let i = 0; i < d; i++) {
                        frag.add(new Segment());
                    }
                } else if (d < 0) {
                    frag.removeSegments(c);
                }
            }
        }
        _updateVertex() {
            let me = this;
            this._genSegs();
            let outer = this.children[0];
            let inner = this.children[1];
            let vss = [
                []
            ];
            inner && vss.push([])
            let t = this.getSpecType();
            if (t === _type.Ring) {
                this.fillRule = "evenodd";
            }
            let vv = this.sweep % 360;
            !vv && (vv = 360);
            let pa = this._normalizeAngle * (vv / 360);
            let sgm = this.segmention;

            let center = this.center,
                radius = this.radius;
            let r = new Vec(radius, 0).rotate(this.start);
            let na = vv / sgm;
            let max = sgm + (vv === 360 ? 0 : 1);

            if (t === _type.Pie) {
                vss[0].push(center.x, center.y, center.x, center.y, center.x, center.y);
                oft = 1;
            }
            let innerVs = [];
            for (let i = 0; i < max; i++) {
                let p = new Vec(),
                    hi = new Vec(),
                    ho = new Vec();
                let cr = r.rotate(na * i);
                p.set(center.add(cr));
                if (i !== 0 || vv === 360) {
                    hi.set(cr.multiply(pa).rotate(-90));
                }
                if (i !== max - 1 || vv === 360) {
                    ho.set(cr.multiply(pa).rotate(90));
                }
                vss[0].push(p.x, p.y, hi.x + p.x, hi.y + p.y, ho.x + p.x, ho.y + p.y);
                if (t === _type.Ring || t === _type.CRing) {
                    p.set(center.add(cr.multiply(this.ratio)));
                    hi = hi.multiply(this.ratio);
                    ho = ho.multiply(this.ratio);
                    if (t === _type.Ring) {
                        vss[1].push(p.x, p.y, hi.x + p.x, hi.y + p.y, ho.x + p.x, ho.y + p.y);
                    } else {
                        innerVs.unshift(p.x, p.y, ho.x + p.x, ho.y + p.y, hi.x + p.x, hi.y + p.y);
                    }
                }
            }!!innerVs.length && vss[0].push(...innerVs);
            if (!this.closeCap && t === _type.Arc) {
                outer.closed = false;
            }
            this.children.forEach((v, idx) => {
                me.bfVertex.set(v, vss[idx]);
            });
            this._updateSegments();
            return this;
        }
    }
    Path.Circle = Circle;
}