/*
    A:B:C:D:E:F
    get(A) A,B,C,D,E,F
    get(B) A,B,C,D,E,F
*/
class SingleSideIndex {
    constructor() {
        this.items = [];
        this.k_idx = new Map();
        this.v_idx = new Map();
    }
    len() {
        return this.items.length;
    }
    add(vs, ...idx) {
        let me = this;
        let len = this.items.length;
        let _idx = this.items.isRangeL(idx[0]) ? idx[0] : len;
        vs.forEach(k => {
            me.k_idx.set(k, _idx);
        });
        this.v_idx.set(vs, _idx);
        this.items.splice(_idx, 0, vs);
        this._updateIdx(_idx);
        return this;
    }
    get(v) {
        let idx = this.k_idx.get(v);
        return this.items[idx] || [];
    }
    getByIndex(idx) {
        return this.items[idx] || [];
    }
    rm(k) {
        let me = this;
        let idx = this.k_idx.get(k);
        let vs = this.items[idx];
        if (!vs) return this;
        vs.forEach(v => {
            me.k_idx.delete(v);
        });
        this.items.splice(idx, 1);
        this.v_idx.delete(vs);
        this._updateIdx(idx);
        return this;
    }
    rmByIndex(idx) {
        let me = this;
        let items = this.items;
        if (!items.isRangeL(idx)) return;
        let vs = items[idx];
        if (!vs) return this;
        vs.forEach(v => {
            me.k_idx.delete(v);
        });
        items.splice(idx, 1);
        this.v_idx.delete(vs);
        this._updateIdx(idx);
        return this;
    }
    forEach(fn) {
        for (let i = 0; i < this.items.length; i++) {
            fn(this.items[i], i);
        }
        return this;
    }
    move(start, end) {
        let items = this.items;
        if (!items.isRangeL(start) || !items.isRangeL(end)) return;
        let item = this.items.splice(start, 1);
        this.items.splice(end, 0, ...item);
        this._updateIdx(start, end);
        return this;
    }
    // : bool
    exist(vs) {
        let v = this.v_idx.get(vs);
        return !isUndefined(v);
    }
    existByKey(k) {
        let _k = this.k_idx.get(k);
        return !isUndefined(_k);
    }
    getAll() {
        return this.items;
    }
    _changeVVIdx(k, ) {
        let vi = this.vv_idx.get(k);

    }
    _updateIdx(start, end) {
        let items = this.items,
            me = this;
        end = typeof end === "number" ? end : items.length - 1;
        let max, min;
        start > end ?
            (max = start, min = end) :
            (max = end, min = start);
        max = max >= items.length ? max - 1 : max;
        min = min < 0 ? 0 : min;
        for (let i = min; i <= max; i++) {
            let vs = items[i];
            vs.forEach(v => {
                me.k_idx.set(v, i);
            });
            this.v_idx.set(vs, i);
        }
        return this;
    }
    clear() {
        this.items = [];
        this.k_idx = new Map();
        this.v_idx = new Map();
    }
}

// tag索引
class TagIdx {
    constructor() {
        let me = this;
        let _vm = new Map(); // Tag : M
        let _tm = new Map(); // V : M
        assign(this, {
            put(v, ...tags) {
                tags.forEach(tag => {
                    let tm = _tm.get(v);
                    if (!tm) {
                        tm = new Map();
                        _tm.set(v, tm);
                    }
                    if (!tm.get(tag)) {
                        let vm = _vm.get(tag);
                        if (!vm) {
                            vm = new Map();
                            _vm.set(tag, vm);
                        }
                        vm.set(v, true);
                        tm.set(tag, v);
                    }
                });
                return me;
            },
            is(v, tag) {
                let ret = false;
                let m = _vm.get(tag);
                if (m) {
                    if (m.get(v)) {
                        ret = true;
                    }
                }
                return ret;
            },
            get(v, fn) {
                let ret = _tm.get(v);
                ret && fn && ret.forEach(fn);
                return ret;
            },
            or(v, ...tags) {
                let ret = false;
                let found = false;
                tags.forEach(tag => {
                    if (found)
                        return;
                    if (me.is(v, tag)) {
                        ret = true;
                        found = true;
                    }
                })
                return ret;
            },
            rm(v, ...tags) {
                tags.forEach(tag => {
                    let vm = _vm.get(tag);
                    if (vm) {
                        vm.delete(v);
                    }
                    let tm = _tm.get(v);
                    if (tm) {
                        tm.delete(tag);
                    }
                    if (vm.size === 0) {
                        _vm.delete(tag);
                    }
                    if (tm.size === 0) {
                        _tm.delete(v);
                    }
                })
                return me;
            },
            clear(v) {
                let tm = _tm.get(v);
                if (tm) {
                    tm.forEach((_, tag) => {
                        let vm = _vm.get(tag);
                        vm.delete(v);
                        tm.delete(tag);
                        if (vm.size === 0) {
                            _vm.delete(tag);
                        }
                    });
                    if (tm.size === 0) {
                        _tm.delete(v);
                    }
                }
                return me;
            },
        })
    }
}