{
    let _ = [
        new Vec(-1, -1),
        new Vec(1, -1),
        new Vec(1, 1),
        new Vec(-1, 1),
    ];
    class Rect extends Path {
        constructor(a, b) {
            super(new Fragment({
                segments: [
                    [],
                    [],
                    [],
                    []
                ],
                closed: true,
            }));
            assign(this, {
                center: new Vec(),
                radius: new Vec(),
                sides: [0, 0, 0, 0],
                autoComputed: true,
            });
            a && b && this.fromTo(a, b);
        }
        fromTo(a, b) {
            a = a || new Vec;
            b = b || new Vec;
            this.setCorner(0, a);
            this.setCorner(2, b);
            this._updateByAB(a, b);
            return this;
        }
        setCorner(idx, v) {
            let _ = idx % 2 ? 0 : 1,
                cross = ["x", "y"],
                ps = [v.x, v.y];
            let main = this.children[0];
            let vs = this.bfVertex.get(main);
            vs[idx * 6 + 0] = v.x;
            vs[idx * 6 + 1] = v.y;
            vs[idx * 6 + 2] = v.x;
            vs[idx * 6 + 3] = v.y;
            vs[idx * 6 + 4] = v.x;
            vs[idx * 6 + 5] = v.y;

            vs[main.nextIdx(idx) * 6 + _] = ps[_];
            vs[main.nextIdx(idx) * 6 + 2 + _] = ps[_];
            vs[main.nextIdx(idx) * 6 + 4 + _] = ps[_];

            vs[main.prevIdx(idx) * 6 + 1 - _] = ps[1 - _];
            vs[main.prevIdx(idx) * 6 + 2 + 1 - _] = ps[1 - _];
            vs[main.prevIdx(idx) * 6 + 4 + 1 - _] = ps[1 - _];

            this._updateSegments();
            let a = main.segments[0].point,
                b = main.segments[2].point;
            this._updateByAB(a, b);
            return this;
        }
        getCorner(idx) {
            let c = this.center.clone(),
                r = this.radius.clone().multiply(_[idx]);
            return c.add(r);
        }
        setCenter(v) {
            let center = this.center,
                radius = this.radius;
            center.set(v);
            this.mp.center.set(v);
            let a = center.add(radius.multiply(-1)),
                b = center.add(radius);
            this.setCorner(0, a);
            this.setCorner(2, b);
            this._updateByAB(a, b);
            return this;
        }
        setSide(idx, n) {
            let _ = idx % 2 ? 0 : 1,
                cross = ["x", "y"];
            this.sides[idx] = n;
            let main = this.children[0];
            let segs = main.segments;
            segs[idx].point[cross[_]] = n;
            segs[main.nextIdx(idx)].point[cross[_]] = n;
            let half = (this.sides[(1 - _) + 2] - this.sides[1 - _]) / 2;
            this.center[cross[_]] = this.sides[1 - _] + half;
            this.radius[cross[_]] = half * (_ ? 1 : -1);
            return this;
        }
        setRadius(v) {
            let center = this.center,
                radius = this.radius;
            radius.set(v);
            let a = center.add(radius.multiply(-1)),
                b = center.add(radius);
            this.setCorner(0, a);
            this.setCorner(2, b);
            this._updateByAB(a, b);
            return this;
        }
        toBounds() {
            return new Bounds(this.getCorner(0), this.getCorner(2));
        }
        _updateByAB(a, b) {
            this.radius = b.subtract(a).multiply(0.5);
            let center=a.add(this.radius);
            this.center.set(center);
            this.mp.center.set(center);
            this.sides[0] = a.y;
            this.sides[1] = b.x;
            this.sides[2] = b.y;
            this.sides[3] = a.x;
        }
    }
    Path.Rect = Rect;
}
let Rect = Path.Rect;