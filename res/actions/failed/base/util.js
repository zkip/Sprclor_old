class Interfacer {
    constructor(opt) {
        if (typeof opt != "object") console.error("Param 'opt' must be 'object'.");
        this.get = () => opt;
    }
    is(obj) {
        if (typeof obj !== "object") {
            console.error(`Must 'object', give ${typeof obj}`);
            return false
        };
        let opt = this.get();
        for (let k in opt) {
            let o = obj[k];
            let tTyp = opt[k];
            let typ = typeof o;
            if (typ === "undefined") {
                console.error(`Haven't ${tTyp} ${k}`);
                return false;
            } else if (typ === tTyp || typ === "object") {
                if (typeof tTyp === "function" || tTyp === Array) {
                    let cstor = o.constructor,
                        cstorT = tTyp;
                    if (cstor === cstorT) return true
                    else {
                        console.log(cstor, o);
                        console.error(`Must ${k} Type ${cstorT.name}, give ${k} Type ${cstor.name}`);
                        return false
                    };
                } else {
                    return true;
                }
            } else {
                console.error(`Must Type ${tTyp.name}, give Type ${typ}`);
                return false;
            }
        }
    }
}

function interface(opt) {
    let inter = new Interfacer(opt);
    return inter;
}
/*
    ignoreOpt:
        + empty                 强制覆盖
        + list M<str,bool>      列表中的值会被忽略
        + 'define'              定义模式，当target有定义时将会忽略
        + 'give'                赋值模式，当target没有定义时忽略
        + 'extend'              继承模式，当target本身（而非原型链上）有定义时会被忽略
*/
{
    let _ = {
        define: 3,
        give: 4,
        extend: 5,
    };
    let _checkMode = (ignoreOpt) => {
        let typ = typeof ignoreOpt;
        if (typ === "object") {
            return 2;
        } else if (typ === "string") {
            let ret = _[ignoreOpt];
            if (ret) return ret;
        } else {
            if (!ignoreOpt) return 1;
        }
        return 0;
    }
    let _has = Reflect.has;

    function assign(target, ops, ignoreOpt) {
        let _ = (target, ops, ...keys) => {
            if (typeof target === "function") {
                if (typeof ops === "function") {
                    _(target.prototype, ops.prototype, Object.getOwnPropertyNames(ops.prototype));
                } else {
                    _(target.prototype, ops);
                }
            } else {
                let mode = _checkMode(ignoreOpt);
                if (keys.length === 0)
                    keys = [Object.keys(ops)];
                for (let i = 0; i < keys[0].length; i++) {
                    let k = keys[0][i];
                    if (k === "constructor") continue;
                    // if (!ignoreOpt || !Reflect.has(ignoreOpt, k))
                    if (mode === 1) {
                        target[k] = ops[k];
                    } else if (mode === 2) {
                        if (!_has(ignoreOpt, k)) {
                            target[k] = ops[k];
                        }
                    } else if (mode === 3) {
                        if (!_has(target, k)) {
                            target[k] = ops[k];
                        }
                    } else if (mode === 4) {
                        if (_has(target, k)) {
                            target[k] = ops[k];
                        }
                    } else if (mode === 5) {
                        if (!target.hasOwnProperty(k)) {
                            target[k] = ops[k];
                        }
                        // console.log(target,k,target.hasOwnProperty(k));
                    }
                }
                return target;
            }
        }
        return _(target, ops);
    }
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

function getType(o) {
    return o.constructor;
}

function isRange(arr, idx) {
    return idx < arr.length && idx > 0;
}

function isRangeL(arr, idx) {
    return idx < arr.length && idx >= 0;
}

function isRangeR(arr, idx) {
    return idx <= arr.length && idx > 0;
}

function isRangeB(arr, idx) {
    return idx <= arr.length && idx >= 0;
}

Map.prototype.first = function () {
    return this.values().next().value;
}
Map.prototype.firstKey = function () {
    return this.keys().next().value;
}

Array.prototype.isRange = function (idx) {
    return isRange(this, idx);
}
Array.prototype.isRangeL = function (idx) {
    return isRangeL(this, idx);
}
Array.prototype.isRangeR = function (idx) {
    return isRangeR(this, idx);
}
Array.prototype.isRangeB = function (idx) {
    return isRangeB(this, idx);
}
Array.prototype.lastIdx = function () {
    return this.length - 1;
}
Array.prototype.last = function () {
    return this[this.length - 1];
}
Array.prototype.clone = function () {
    return this.filter(() => true);
}
MouseEvent.prototype.toClientVec = function () {
    return new Vec(this.clientX, this.clientY);
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
    let o = {};
    let _ = GenConstFn();
    attrs.forEach(v => {
        o[v] = _();
    })
    return o;
}