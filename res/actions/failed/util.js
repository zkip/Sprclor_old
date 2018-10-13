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

let Vec = paper.Point;
let Matrix = paper.Matrix;
let Bounds = paper.Rectangle;
let Layer = paper.Layer;