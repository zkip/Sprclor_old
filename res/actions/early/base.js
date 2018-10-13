// @add.js

class Base {
    constructor() {
        this.ID = Base.Count;
        Base.Count = add(Base.Count, '1');
    }
}
Base.Count = '0';

class Vector {
    constructor(x, y) {
        let me = this;
        assign(this, {
            _len: 0,
            _changed: 0,
            x: 0,
            y: 0,
        });
        this.set(x, y);
    }
    set(x, y) {
        if (!x) return this;
        let _isx = isUndefined(x.x);
        let _isy = isUndefined(x.y);
        if (_isx || _isy) {
            _isx && (this.x = x.x);
            _isy && (this.y = x.y);
        } else {
            checkType(x, Number) && (this.x = x);
            checkType(y, Number) && (this.y = y);
        }
        return this;
    }
    normalize() {
        let len = this.len() || 1;
        this.x /= len;
        this.y /= len;
    }
    rotate() {}
    add(v) {
        return new Vector(this.x + v.x, this.y + v.y);
    }
    subtract(v) {
        return new Vector(this.x - v.x, this.y - v.y);
    }
    // Vector/number : Vector
    multiply(v) {
        if (typeof v === "number") {
            return new Vector(this.x * v, this.y * v);
        } else {
            return new Vector(this.x * v.x, this.y * v.y);
        }
    }
    // Vector/number : Vector
    divide(v) {
        if (typeof v === "number") {
            return new Vector(this.x / v, this.y / v);
        } else {
            return new Vector(this.x / v.x, this.y / v.y);
        }
    }
    // Vector/number : Vector
    modulo(v) {
        if (typeof v === "number") {
            return new Vector(this.x % v, this.y % v);
        } else {
            return new Vector(this.x % v.x, this.y % v.y);
        }
    }
    negate() {
        return new Vector(-this.x, -this.y);
    }
    // : number
    dot(v) {
        return this.x * v.x + this.y + v.y;
    }
    cross() {
        return this.x * v.y - this.y * v.x
    }
    len() {
        if (this._changed) {
            let {
                x,
                y
            } = this;
            let {
                sqrt
            } = Math;
            this._len = Math.sqrt(x * x + y * y);
            this._changed = false;
        }
        return this._len;
    }
    // 投影
    project() {}
    // 是否共线
    isCollinear() {}
    // 是否互相垂直
    isOrthogonal() {}
}

// 常量值生成器
// : fn
function GenConstFn() {
    let c = '0';
    return () => {
        c = add(c, '1');
        return c;
    }
}

// : ConstType
function GenConst(...attrs) {
    let o = class {};
    let _ = GenConstFn();
    attrs.forEach(v => {
        o[v] = _();
    })
    return o;
}

function GenOption(...ops) {
    let o = class {
        constructor(argOps) {
            let fOps = null,
                c = 0;
            while (!fOps) {
                console.log(fOps, c);
                fOps = checkOptArg(ops[c++], argOps);
            }
            if (fOps) {
                assign(this, fOps);
            } else {
                throw Check_ERR;
            }
        }
    }

    return o;
}

let Check_ERR = "Option arguments Match Failed";

function checkOptArg(typOps, valOps) {
    let o = {};
    if (typOps === null) {
        return null;
    }
    for (let k in typOps) {
        let typ = typOps[k];
        let ign = false;
        if (k[0] === "_") {
            k = k.slice(1);
            ign = true;
        }
        if (!valOps[k]) {
            if (ign) {
                continue;
            }
            return false;
        }
        if (valOps[k].constructor !== typ) {
            return false;
        }
        o[k] = valOps[k];
    }
    return o;
}

// NumberOrder
let NumberOrder = GenConst(
    "09", "90",
)

let StrNumberOrder = GenConst(NumberOrder);

// StrOrder
let StrOrder = GenConst(
    StrNumberOrder,
    "AZ", "Az", "aZ", // A-Z顺序 [1]忽略大小写 [2]大写优先 [3]小写优先
    "ZA", "zA", "Za", // Z-A顺序 [1]忽略大小写 [2]大写优先 [3]小写优先
    "U", // Unicode
);

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

// obj Opt :
function sg(target, ops) {
    Object.defineProperties(target, ops);
}

// all is undefined
function isUndefined(...a) {
    for (let i = 0; i < a.length; i++) {
        if (typeof a[i] === "undefined") {
            return true;
        }
    }
    return false;
}

function checkType(v, type) {
    return v.constructor === type
}