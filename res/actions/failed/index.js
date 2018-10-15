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
        return typeof this.v_idx.get(vs) === "number";
    }
    existByKey(k) {
        return typeof this.k_idx.get(k) === "number";
    }
    getAll() {
        return this.items;
    }
    _updateIdx(start, end) {
        let items = this.items,
            me = this;
        end = typeof end === "number" ? end : items.length - 1;
        let max, min;
        start > end ?
            (max = start, min = end) :
            (max = end, min = start);
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

class A {}
class B {}
class C {}
class D {}

let idx = new SingleSideIndex();
let a = new A();
let b = new B();
let c = new C();
let d = new D();

let a2 = new A();
let c2 = new C();
idx.add([a, b, c, d]);
idx.add([a2, c2]);
idx.add([new B()]);
idx.add([new B()]);
idx.move(3, 0);
idx.add([new B()]);
idx.add([new B()]);
// idx.rmByIndex(1);
// idx.rm(a);
// console.log(idx);
// console.log(idx.get(a)); // [a,b,c,d]
// console.log(idx.get(b)); // [a,b,c,d]
// console.log(idx.get(c)); // [a,b,c,d]
// console.log(idx.get(d)); // [a,b,c,d]
// console.log(idx.existByKey(a));
// console.log(idx.getAll());
// console.log(idx.get(d));
// console.log(idx);