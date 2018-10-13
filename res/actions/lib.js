
class Vec {
    constructor(x, y) {
        this.x = x || 0;
        this.y = y || 0;
    }
    set(x, y) {
        typeof x === "number" && (this.x = x);
        typeof y === "number" && (this.y = y);
    }
}

function getDistance(p1, p2) {
    return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
}

class Bound {
    constructor() {
        this.left = 0;
        this.right = 0;
        this.top = 0;
        this.bottom = 0;
    }
    setSize(vec) {

    }
}

class Size {
    constructor(w, h) {
        this.width = w || 0;
        this.height = h || 0;
    }
}

class Color {
    constructor(r, g, b, a) {
        this.r = r || 0;
        this.g = g || 0;
        this.b = b || 0;
        this.a = a || 1;
    }
    // :RGBAString
    tx() {
        return "rgba(" + [this.r, this.g, this.b, this.a].join(",") + ")";
    }
}

class Observable {
    constructor() {
        this.pool = {};
    }
    // string,...data,fn:
    subscribe() {
        let subject = arguments[0],
            data, fn;
        if (arguments.length > 2) {
            data = arguments[1];
            fn = arguments[2];
        } else {
            data = null;
            fn = arguments[1];
        }
        if (!this.pool[subject]) {
            this.pool[subject] = {};
        }
        let id = Observable.CreateCounts;
        this.pool[subject][id] = fn;
        Observable.CreateCounts = m_add(id, '1');
        return id;
    }
    // string:
    unsubscribe(subject, id) {
        delete this.pool[subject][id];

    }
    // string,any:
    execute(subject, data, fn) {
        if () {

        }
        for (let id in this.pool[subject]) {
            this.pool[subject][id](data);
        }
    }
}
Observable.CreateCounts = '0';

function assign(target, ops, ...keys) {
    if (typeof target === "function") {
        if (typeof ops === "function") {
            assign(target.prototype, ops.prototype, Object.getOwnPropertyNames(ops.prototype));
        } else {
            assign(target.prototype, ops);
        }
    } else {
        if (keys.length > 0) {
            for (let i = 0; i < keys[0].length; i++) {
                let k = keys[0][i];
                if (k === "constructor") continue;
                target[k] = ops[k];
            }
        } else {
            for (let k in ops) {
                if (k === "constructor") continue;
                target[k] = ops[k];
            }
        }
        return target;
    }
}