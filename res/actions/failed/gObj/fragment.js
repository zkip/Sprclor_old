class Fragment extends paper.Path {
    constructor(...arg) {
        super(...arg);
        assign(this, {
            vertex: [],
        });
        this.applyMatrix=false;
        this._updateVertex();
    }
    getGlobalBounds(){
        return this._getBounds(this.globalMatrix, {
            handle: false,
            stroke: false,
        });
    }
    getResetBounds(){
        return this._getBounds(new Matrix, {
            handle: false,
            stroke: false,
        });
    }
    smooth(...arg) {
        let ret = paper.Path.prototype.smooth.call(this, ...arg);
        this._updateVertex();
        return ret;
    }
    setSharpEnd(idx, v) {
        this.vertex[idx * 6 + 0] = v.x;
        this.vertex[idx * 6 + 1] = v.y;
        this.vertex[idx * 6 + 2] = v.x;
        this.vertex[idx * 6 + 3] = v.y;
        this.vertex[idx * 6 + 4] = v.x;
        this.vertex[idx * 6 + 5] = v.y;
        return this;
    }
    _updateVertex() {
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
    _updateSegments() {
        let count = this.vertex.length / 6 >> 0;
        let vs = this.vertex;
        for (let i = 0; i < count; i++) {
            let start = i * 6,
                px = vs[start],
                py = vs[start + 1],
                hix = vs[start + 2],
                hiy = vs[start + 3],
                hox = vs[start + 4],
                hoy = vs[start + 5];
            this.segments[i].point.set(px, py);
            this.segments[i].handleIn.set(hix - px, hiy - py);
            this.segments[i].handleOut.set(hox - px, hoy - py);
        }
    }
    // idx:uint *count:uint >> uint
    loopIdx(idx, count) {
        let ret = 0;
        isUndefined(count) && (count = 0);
        let len = this.segments.length;
        if (isUndefined(idx)) {
            console.error(`Need param "idx"`);
            return ret;
        } else {
            if (!(idx < len)) {
                console.error(`The param "idx" must: <${len} & >=0`);
                return ret;
            }
        }
        ret = (idx + count) % len;
        if (ret < 0) ret = len + ret;
        return ret;
    }
    // idx:uint >> uint
    nextIdx(idx) {
        return this.loopIdx(idx, 1);
    }
    // idx:uint >> uint
    prevIdx(idx) {
        return this.loopIdx(idx, -1);
    }
}