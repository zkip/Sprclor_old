/*
    mode: 
        + from p1 to p2
        + center + size
*/

class Rect extends Path {
    constructor(radius) {
        super();
        this._radius = new Vector();
        this._vertex = [];
        this._pivot = new Vector();
        this._attrs = {
            width: 0,
            height: 0,
            position: new Vector(),
            rotation: 10,
        };
        this._data.closePath();
        this._data.addSegments([new Vector(0, 0), new Vector(100, 0), new Vector(50, 150), new Vector(90, 10)]);
        this._data.applyMatrix = false;
        this.setRadius(radius);
        this.setPivot(this.getResetBounds().center);
    }
    setSize(w, h) {
        let c = 0;
        let r = this._radius.clone();
        if (typeof w === "number") {
            c++;
            this._radius.x = value / 2;
            this.width = w;
        }
        if (typeof h === "number") {
            c++;
            this._radius.y = value / 2;
            this.height = h;
        }
        if (c > 0) {
            let v = this._radius.divide(r);
            let matrix = new paper.Matrix();
            matrix.scale(v, this.pivot);
            matrix._transformCoordinates(this._vertex, this._vertex, 4);
            this._updateSegments();
        }
        return this;
    }
    setPivot(v) {
        if (typeof v === "number") {
            let p = this._data.globalToLocal(this._data.segments[v].point);
            this._pivot.set(p);
        } else {
            this._pivot.set(v);
        }
        this._updatePivot();
    }
    _updatePivot() {
        this._data.pivot = this._attrs.position.add(this._pivot);
    }
    setPosition(vec) {
        this._updatePivot();
        let p = this._data.globalToLocal(vec);
        this._attrs.position.set(p);
        this.setRadius(this._radius);
    }
    getPosition() {
        return this._data.localToGlobal(this._attrs.position);
    }
    getRotation() {
        return this.rotation;
    }
    setRotation(angle) {
        this.rotation = angle;
    }
    setRadius(vec) {
        this._radius.set(vec);
        let r = this._radius;
        let pos = this._attrs.position;
        this._attrs.width = vec.x * 2;
        this._attrs.height = vec.y * 2;
        let p1 = pos.add(r.multiply(-1));
        this._setVertex(0, p1);
        this._setVertex(1, pos.add(r.multiply(1, -1)));
        this._setVertex(2, pos.add(r));
        this._setVertex(3, pos.add(r.multiply(-1, 1)));
        this._updateSegments();
        return this;
    }
    nextIdx(idx) {
        return idx + 1 > 3 ? 0 : idx + 1;
    }
    prevIdx(idx) {
        return idx - 1 < 0 ? 3 : idx - 1;
    }
    setCorner(idx, p) {
        let local = this.globalToLocal(p);
        if (idx < 0 || idx > 3) return;
        this.segments[idx].point.set(local);
        if (idx % 2) {
            this.segments[this.prevIdx(idx)].point.y = local.y;
            this.segments[this.nextIdx(idx)].point.x = local.x;
        } else {
            this.segments[this.prevIdx(idx)].point.x = local.x;
            this.segments[this.nextIdx(idx)].point.y = local.y;
        }
        return this;
    }
    _setVertex(idx, p) {
        this._vertex[idx * 2] = p.x;
        this._vertex[idx * 2 + 1] = p.y;
        return this;
    }
    _updateSegments() {
        for (let i = 0, c = 0; i < 8; i += 2, c++) {
            this._data.segments[c].point.set(this._vertex[i], this._vertex[i + 1]);
        }
        return this;
    }

}
Rect.getSize = (idx, vertex) => {
    if (idx === 0) {
        return vertex[0].subtract(vertex[2]);
    } else if (idx === 1) {
        return vertex[1].subtract(vertex[3]);
    } else if (idx === 2) {
        return vertex[2].subtract(vertex[0]);
    } else if (idx === 3) {
        return vertex[3].subtract(vertex[1]);
    }
    let p = vertex[0].subtract(vertex[2]);
    return new Vector(Math.abs(p.x), Math.abs(p.y));
}
Path.Rect = Rect;