class Selection {
    constructor() {
        this.v_items = [];
        this.k_items = [];
        this.k_idx = new Map();
        this.v_idx = new Map();
    }
    move(idx, dIdx) {
        let len = this.len();
        if (idx >= len || dIdx >= len || idx < 0 || dIdx < 0) return;
        let k = this.k_items.splice(idx, 1);
        this.k_items.splice(dIdx, 0, ...k);
        let v = this.v_items.splice(idx, 1);
        this.v_items.splice(dIdx, 0, ...v);
        let max, min;
        idx > dIdx ?
            (max = idx, min = dIdx) :
            (max = dIdx, min = idx);
        for (let i = min; i <= max; i++) {
            this.k_idx.set(this.k_items[i], i);
            this.v_idx.set(this.v_items[i], i);
        }
        return this;
    }
    // *uint,T : me
    insert(...arg) {
        let idx;
        if (arg.length > 1) {
            idx = arg[0];
        }
        if (idx > this.k_items.length) return this;
        arg.forEach((a, c) => {
            if (c === 0) return;
            this.add(Symbol(), a, idx++);
        })
        return this;
    }
    append(...vs) {
        return this.insert(this.k_items.length, ...vs);
    }
    // *uint,T : me
    insertOnce(...arg) {
        let idx;
        if (arg.length > 1) {
            idx = arg[0];
        }
        if (idx > this.k_items.length) return this;
        let me = this;
        arg.forEach((a, c) => {
            if (c === 0) return;
            if (typeof me.v_idx.get(a) === "undefined")
                me.add(Symbol(), a, idx++);
        })
        return this;
    }
    appendOnce(...vs) {
        return this.insertOnce(this.k_items.length, ...vs);
    }
    len() {
        return this.k_items.length;
    }
    // K,T,*uint : me
    add(k, v, ...idx) {
        let _idx = typeof idx[0] < 0 ? this.k_items.length : idx[0];
        this.k_items.splice(_idx, 0, k);
        this.v_items.splice(_idx, 0, v);
        this.k_idx.set(k, _idx);
        this.v_idx.set(v, _idx);
        return this;
    }
    // K/uint : me
    rm(k) {
        let idx = this.k_idx.get(k);
        let v = this.v_items[idx];
        return this._rm(k, v, idx);
    }
    rmByValue(v) {
        let idx = this.v_idx.get(v);
        let k = this.k_items[idx];
        return this._rm(k, v, idx);
    }
    rmByIndex(idx) {
        let k = this.k_items[idx];
        let v = this.v_items[idx];
        return this._rm(k, v, idx);
    }
    _rm(k, v, idx) {
        this.k_items.splice(idx, 1);
        this.v_items.splice(idx, 1);
        this.k_idx.delete(k);
        this.v_idx.delete(v);
        return this;
    }
    // K : T
    get(k) {
        let idx = this.k_idx[k];
        return this.k_items[idx];
    }
    getByIndex(idx) {
        return this.v_items[idx];
    }
    getKeyByIndex(idx) {
        return this.k_items[idx];
    }
    // : bool
    exist(v) {
        return typeof this.v_idx.get(v) === "number";
    }
    existByKey(k) {
        return typeof this.k_idx.get(k) === "number";
    }
    // fn(K,T,uint) : me
    forEach(fn) {
        for (let i = 0; i < this.k_items.length; i++) {
            let k = this.k_items[i],
                v = this.v_items[i];
            fn(k, v, i);
        }
        return this;
    }
    // : []T
    getAll() {
        return this.v_items;
    }
    // : []K
    getAllKey() {
        return this.k_items;
    }
    clear() {
        this.k_items = [];
        this.v_items = [];
        this.k_idx = new Map();
        this.v_idx = new Map();
        return this;
    }
    set(selection) {
        this.k_items = selection.k_items;
        this.v_items = selection.v_items;
        this.k_idx = selection.k_idx;
        this.v_idx = selection.v_idx;
        return this;
    }
}
Selection.eventTypeList = {
    addAfter: true,
    rmAfter: true,
    moveAfter: true,
    addBefore: true,
    rmBefore: true,
    moveBefore: true,
    clearBefore: true,
};
class MEvent {
    constructor(...eTypes) {
        this.fns = new Map();
        this.eTypes = new Map();
        this.isPrevent = new Map();
        this.expand(...eTypes);
    }
    _okType(et) {
        return this.eTypes.get(et);
    }
    execute(et, ...arg) {
        let me = this;
        this.fns.get(et).forEach((_, fn) => {
            let prevent = fn(...arg);
            if (prevent) {
                me.isPrevent.set(et, true);
            }
        });
        return this;
    }
    expand(...eTypes) {
        eTypes.forEach(t => {
            this.eTypes.set(t, true);
            this.isPrevent.set(t, false);
            this.fns.set(t, new Selection());
        })
        return this;
    }
    add(et, fn) {
        if (!this._okType(et)) return;
        this.fns.get(et).appendOnce(fn);
        return this;
    }
    rm(et, fn) {
        if (!this._okType) return;
        this.fns.get(et).rmByValue(fn);
        return this;
    }
    // : bool
    getIsPrevent(et) {
        if (!this._okType(et)) return false;
        return this.isPrevent.get(et);
    }
}


class SelectionEv extends Selection {
    constructor() {
        super();
        this.et = new MEvent(
            "add-after", "rm-after", "move-after",
            "add-before", "rm-before", "move-before", "clear-before"
        );
    }
    on(et, fn) {
        this.et.add(et, fn);
        return this;
    }
    add(k, v, ...idx) {
        if (this.et.execute("add-before", k, v, ...idx).getIsPrevent("add-before")) return;
        let ret = Selection.prototype.add.apply(this, arguments);
        this.et.execute("add-after", k, v, ...idx);
        return ret;
    }
    _rm(k, v, idx) {
        if (this.et.execute("rm-before", k, v, idx).getIsPrevent("rm-before")) return;
        let ret = Selection.prototype._rm.apply(this, arguments);
        this.et.execute("rm-after", k, v, idx);
        return ret;
    }
    move(idx, dIdx) {
        if (this.et.execute("move-before", idx, dIdx).getIsPrevent("move-before")) return;
        let ret = Selection.prototype.move.apply(this, arguments);
        this.et.execute("move-after", idx, dIdx);
        return ret;
    }
    clear() {
        if (this.et.execute("clear-before").getIsPrevent("clear-before")) return;
        let ret = Selection.prototype.clear.apply(this, arguments);
        return ret;
    }
}

let sct = new SelectionEv();
sct.insert(0, 1);
sct.insert(0, 2, 3);
sct.insert(0, 4);
sct.insert(0, 5);
console.log(sct.v_items);