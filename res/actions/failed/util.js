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

let Vec = paper.Point;
let Matrix = paper.Matrix;
let Bounds = paper.Rectangle;
let Layer = paper.Layer;