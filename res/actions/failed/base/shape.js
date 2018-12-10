// using bezier
let Shape; {
    let alignFrags = (me, n) => {
        let len = me.len();
        if (len < n) {
            for (let i = 0; i < n - len; i++) {
                let f = new Frag(me);
                me.vertex[i] = f.vertex;
                me.append(f);
            }
        } else if (len > n) {
            for (let i = 0; i < len - n; i++) {
                me.rmByIdx(n);
            }
            me.vertex.splice(n);
        }
    }
    Shape = class extends SelectionEv {
        constructor() {
            super();
            assign(this, {
                vertex: [], // [][]num 二维数组，每一个行表示一个Fragment
                origin: new Vec,
            });
            this.ev.expand("updated", "originUpdated");
            this.on("add-before", (k, v, i) => {
                // console.log(k, v, i);
            })
        }
        byCount(n) {
            alignFrags(this, n);
            return this;
        }
    }
    class Frag {
        constructor(owner) {
            assign(this, {
                vertex: [],
                getOwner: () => owner,
            })
        }
        forEach(fn) {
            for (let i = 0; i < this.vertex.length / 6 >> 0; i++) {
                fn(i);
            }
            return this;
        }
        getCount() {
            return this.vertex.length / 6 >> 0;
        }
        _byCount(n) {
            for (let i = 0; i < n; i++) {
                this.vertex.push(0, 0, 0, 0, 0, 0);
            }
            return this;
        }
        byCount(n) {
            this._byCount(n);
            this._update();
            return this;
        }
        _setEnd(idx, v) {
            if (!isUndefined(v.x))
                this.vertex[idx * 6 + 0] = v.x;
            if (!isUndefined(v.y))
                this.vertex[idx * 6 + 1] = v.y;
            return this;
        }
        setEnd(idx, v) {
            this._setEnd(idx, v);
            this._update();
            return this;
        }
        _getEnd(idx) {
            return [
                this.vertex[idx * 6 + 0],
                this.vertex[idx * 6 + 1]
            ]
        }
        _getA(idx) {
            return [
                this.vertex[idx * 6 + 2],
                this.vertex[idx * 6 + 3]
            ]
        }
        _getB(idx) {
            return [
                this.vertex[idx * 6 + 4],
                this.vertex[idx * 6 + 5]
            ]
        }
        getEnd(idx) {
            return new Vec(...this._getEnd(idx));
        }
        getA(idx) {
            return new Vec(...this._getA(idx));
        }
        getB(idx) {
            return new Vec(...this._getB(idx));
        }
        getAB(idx) {
            return [this.getA(idx), this.getB(idx)];
        }
        getCtrl(idx) {
            return [this.getEnd(idx), ...this.getAB(idx)];
        }
        _setA(idx, v) {
            if (!isUndefined(v.x))
                this.vertex[idx * 6 + 2] = v.x;
            if (!isUndefined(v.y))
                this.vertex[idx * 6 + 3] = v.y;
            return this;
        }
        setA(idx, v) {
            this._setA(idx, v);
            this._update();
            return this;
        }
        _setB(v) {
            if (!isUndefined(v.x))
                this.vertex[idx * 6 + 4] = v.x;
            if (!isUndefined(v.y))
                this.vertex[idx * 6 + 5] = v.y;
            return this;
        }
        setB(idx, v) {
            this._setB(idx, v);
            this._update();
            return this;
        }
        _setCtrl(idx, ...arg) {
            let len = arg.length;
            if (len === 1) {
                this._setEnd(idx, arg[0]);
                this._makeSharp(idx, arg[0]);
            } else if (len === 2) {
                this._setA(idx, arg[0]);
                this._setB(idx, arg[1]);
            } else if (len === 3) {
                this._setEnd(idx, arg[0]);
                this._setA(idx, arg[1]);
                this._setB(idx, arg[2]);
            }
            return this;
        }
        setCtrl(idx, ...arg) {
            this._setCtrl(idx, ...arg);
            this._update();
            return this;
        }
        _makeSharp(idx, v) {
            if (idx >= this.getCount()) return this;
            if (!v) {
                v = new Vec(
                    this.vertex[idx * 6 + 0],
                    this.vertex[idx * 6 + 1]
                );
            }
            if (!isUndefined(v.x)) {
                this.vertex[idx * 6 + 0] = v.x;
                this.vertex[idx * 6 + 2] = v.x;
                this.vertex[idx * 6 + 4] = v.x;
            }
            if (!isUndefined(v.y)) {
                this.vertex[idx * 6 + 1] = v.y;
                this.vertex[idx * 6 + 3] = v.y;
                this.vertex[idx * 6 + 5] = v.y;
            }
            return this;
        }
        makeSharp(idx, v) {
            this._makeSharp(idx, v);
            this._update();
            return this;
        }
        _makeSmooth() {
            return this;
        }
        makeSmooth() {
            this._makeSmooth();
            this._update();
            return this;
        }
        // idx:uint *count:uint >> uint
        loopIdx(idx, count) {
            let ret = 0;
            isUndefined(count) && (count = 0);
            let len = this.vertex.length / 6 >> 0;
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
        _update() {
            let owner = this.getOwner();
            owner && owner.ev.execute("updated", this.getOwner().getIdx(this));
        }
    }
    Shape.Fragment = Frag;
}