class Shape {
    constructor() {
        this._vertex = [];
    }
}
Shape.Rect = class extends Shape {
    constructor(start, size) {
        super();
        this.sides = [];
        for (let i = 0, c = 0; i < 8; i += 2, c++) {
            this._vertex[i] = 0;
            this._vertex[i + 1] = 0;
            this.sides[c] = 0;
        }
        start && size &&
            this.setSize(start, size);
    }
    setSide(idx, side) {
        this.sides[idx] = side;
        this._updateVertexFromSides();
    }
    setSides(sides) {
        this.sides = sides;
        this._updateVertexFromSides();
    }
    fromTo(a,b){
        this.setVertex(0, a.clone());
        this.setVertex(2, b.clone());
        this._updateSideFromVertex();
        return this;
    }
    setSize(pos, size) {
        this.setVertex(0, pos.clone());
        this.setVertex(2, pos.clone().add(size));
        this._updateSideFromVertex();
        return this;
    }
    setVertex(idx, p) {
        let start = idx * 2,
            _ = idx % 2 ? 1 : 0,
            ps = [p.x, p.y];
        this._vertex[start] = p.x;
        this._vertex[start + 1] = p.y;
        this._vertex[this.nextIdx(idx) * 2 + _] = ps[_];
        this._vertex[this.prevIdx(idx) * 2 + 1 - _] = ps[1 - _];
        return this;
    }
    getVertex(idx) {
        let start = idx * 2;
        return new Vec(this._vertex[start], this._vertex[start + 1])
    }
    _updateSideFromVertex() {
        for (let i = 0; i < 4; i++) {
            let start = i * 2;
            this.sides[i] = this._vertex[start + (i % 2 ? 1 : 0)];
        }
        return this;
    }
    _updateVertexFromSides() {
        for (let i = 0; i < 4; i++) {
            let start = i * 2,
                _ = i % 2 ? 1 : 0,
                idx = start + _,
                side = this.sides[i];
            this._vertex[idx] = side;
            this._vertex[this.nextIdx(i) * 2 + _] = side;
        }
    }
    nextIdx(idx) {
        return idx + 1 > 3 ? 0 : idx + 1;
    }
    prevIdx(idx) {
        return idx - 1 < 0 ? 3 : idx - 1;
    }
    clone() {
        let r = new Shape.Rect();
        r._vertex = this._vertex;
        r._updateSideFromVertex();
        return r;
    }
    toBounds() {
        return new Bounds(this.getVertex(0), this.getVertex(2));
    }
}