let Fragment; {
    let autoAlignSegments = (me, vx) => {
        let len = me.segments.length,
            n = vx.length / 6 >> 0;
        if (len < n) {
            for (let i = 0; i < n - len; i++) {
                let seg = new Segment();
                seg.point.set(vx[i * 6 + 0], vx[i * 6 + 1]);
                seg.handleIn.set(vx[i * 6 + 2], vx[i * 6 + 3]);
                seg.handleOut.set(vx[i * 6 + 4], vx[i * 6 + 5]);
                me.add(seg);
            }
        } else if (len > n) {
            me.removeSegments(n);
        }
    }
    Fragment = class extends paper.Path {
        constructor() {
            super();
            assign(this, {
                vertex: [],
            });
            this._updateVertexFromSegments();
        }
        smooth(...arg) {
            let ret = paper.Path.prototype.smooth.call(this, ...arg);
            this._updateVertex();
            return ret;
        }
        _updateVertexFromSegments() {
            this.segments.forEach((seg, idx) => {
                let p = seg.point;
                this.vertex[idx * 6] = p.x;
                this.vertex[idx * 6 + 1] = p.y;
                this.vertex[idx * 6 + 2] = seg.handleIn.x + p.x;
                this.vertex[idx * 6 + 3] = seg.handleIn.y + p.y;
                this.vertex[idx * 6 + 4] = seg.handleOut.x + p.x;
                this.vertex[idx * 6 + 5] = seg.handleOut.y + p.y;
            })
            return this;
        }
        _update() {
            let count = this.vertex.length / 6 >> 0;
            let vx = this.vertex;
            autoAlignSegments(this, this.vertex);
            for (let i = 0; i < count; i++) {
                let start = i * 6,
                    px = vx[start],
                    py = vx[start + 1],
                    hix = vx[start + 2],
                    hiy = vx[start + 3],
                    hox = vx[start + 4],
                    hoy = vx[start + 5];
                this.segments[i].point.set(px, py);
                this.segments[i].handleIn.set(hix - px, hiy - py);
                this.segments[i].handleOut.set(hox - px, hoy - py);
            }
            return this;
        }
    }
}