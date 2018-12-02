// using bezier
class Shape {
    constructor(count) {
        this._vertex = new Map();
        this.setSub("main", count);
    }
    /*
        name:str idx:uint frag:([3]Vec)/Vec /
        idx:uint frag:([3]Vec)/Vec /
        name:str count:uint /
        name:str /
    */
    setSub(...arg) {
        arg = arg.filter(v => !isUndefined(v));
        let len = arg.length;
        let name = "main",
            idx, count = 0,
            frag = new Array(3);
        let _ft, _st;
        // checking
        if (len >= 1) {
            _ft = typeof arg[0];
            if (_ft === "string") {
                name = arg[0];
            } else if (_ft === "number") {
                idx = arg[0];
            }
            let _frag;
            _st = typeof arg[1];
            if (_st === "number" || len === 1) {
                count = arg[1] || 0;
            } else {
                _frag = arg[len - 1];
                if (_frag.constructor !== Array) _frag = [_frag];
                for (let i = 0; i < frag.length; i++) frag[i] = _frag[i] || new Vec();
                if (len === 3) {
                    idx = arg[1];
                }
            }
        }
        // operating
        if (_ft === "string" && len !== 3) {
            let a = [];
            for (let i = 0; i < count * 6; i++) a.push(0);
            this._vertex.set(name, a);
        } else {
            let sub = this._vertex.get(name);
            if (!sub) return this;
            let start = idx * 6;
            sub[start + 0] = frag[0].x;
            sub[start + 1] = frag[0].y;
            sub[start + 2] = frag[1].x;
            sub[start + 3] = frag[1].y;
            sub[start + 4] = frag[2].x;
            sub[start + 5] = frag[2].y;
        }
        return this;
    }
    getSub(name) {
        return this._vertex.get(name);
    }
    // *name:str idx:uint
    getVertex() {
        let name = "main",
            idx;
        let len = arguments.length;
        if (len > 1) {
            name = arguments[0];
        }
        idx = arguments[len - 1];

        let sub = this.getSub(name);
        let start = idx * 6;
        let ret = [
            new Vec(sub[start + 0], sub[start + 1]),
            new Vec(sub[start + 2], sub[start + 3]),
            new Vec(sub[start + 4], sub[start + 5])
        ];

        return ret;
    }
    getSubCount() {
        return this._vertex.size;
    }
    eachSub(fn) {
        this._vertex.forEach((v, k) => {
            fn(v, k);
        })
        return this;
    }
    getCount(name) {
        let me = this;
        if (isUndefined(name)) {
            let c = 0;
            this.eachSub((_, name) => {
                c += me.getCount(name);
            })
            return c;
        } else {
            let vs = this._vertex.get(name);
            return vs.length / 6 >> 0;
        }
    }
}