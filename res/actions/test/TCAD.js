class VectorTCAD {

    constructor(x, y, z) {
        this.x = x || 0;
        this.y = y || 0;
        this.z = z || 0;
    }

    set(x, y, z) {
        this.x = x || 0;
        this.y = y || 0;
        this.z = z || 0;
        return this;
    }

    set3(data) {
        this.x = data[0] || 0;
        this.y = data[1] || 0;
        this.z = data[2] || 0;
        return this;
    }

    setV(data) {
        this.x = data.x;
        this.y = data.y;
        this.z = data.z;
        return this;
    }

    multiply(scalar) {
        return new Vector(this.x * scalar, this.y * scalar, this.z * scalar);
    }

    _multiply(scalar) {
        return this.set(this.x * scalar, this.y * scalar, this.z * scalar);
    }

    divide(scalar) {
        return new Vector(this.x / scalar, this.y / scalar, this.z / scalar);
    }

    _divide(scalar) {
        return this.set(this.x / scalar, this.y / scalar, this.z / scalar);
    }

    dot(vector) {
        return this.x * vector.x + this.y * vector.y + this.z * vector.z;
    }

    copy() {
        return new Vector(this.x, this.y, this.z);
    }

    length() {
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
    };

    lengthSquared() {
        return this.dot(this);
    }

    distanceToSquared(a) {
        return this.minus(a).lengthSquared();
    }

    minus(vector) {
        return new Vector(this.x - vector.x, this.y - vector.y, this.z - vector.z);
    }

    _minus(vector) {
        this.x -= vector.x;
        this.y -= vector.y;
        this.z -= vector.z;
        return this;
    }

    _minusXYZ(x, y, z) {
        this.x -= x;
        this.y -= y;
        this.z -= z;
        return this;
    }

    plusXYZ(x, y, z) {
        return new Vector(this.x + x, this.y + y, this.z + z);
    }

    plus(vector) {
        return new Vector(this.x + vector.x, this.y + vector.y, this.z + vector.z);
    }

    _plus(vector) {
        this.x += vector.x;
        this.y += vector.y;
        this.z += vector.z;
        return this;
    }

    normalize() {
        let mag = this.length();
        if (mag === 0.0) {
            return new Vector(0.0, 0.0, 0.0);
        }
        return new Vector(this.x / mag, this.y / mag, this.z / mag);
    }

    _normalize() {
        let mag = this.length();
        if (mag === 0.0) {
            return this.set(0, 0, 0)
        }
        return this.set(this.x / mag, this.y / mag, this.z / mag)
    };

    cross(a) {
        return new Vector(
            this.y * a.z - this.z * a.y,
            this.z * a.x - this.x * a.z,
            this.x * a.y - this.y * a.x
        );
    };

    negate() {
        return this.multiply(-1);
    }

    _negate() {
        return this._multiply(-1);
    }

    toArray() {
        return [this.x, this.y, this.z];
    }

    static fromData(arr) {
        return new Vector().set3(arr);
    }
}

Vector.prototype.data = Vector.prototype.toArray;

Vector.prototype.unit = Vector.prototype.normalize;
Vector.prototype._unit = Vector.prototype._normalize;

Vector.prototype.scale = Vector.prototype.multiply;
Vector.prototype._scale = Vector.prototype._multiply;

class BBox {

    constructor() {
        this.minX = Number.MAX_VALUE;
        this.minY = Number.MAX_VALUE;
        this.minZ = Number.MAX_VALUE;
        this.maxX = -Number.MAX_VALUE;
        this.maxY = -Number.MAX_VALUE;
        this.maxZ = -Number.MAX_VALUE;
    }

    checkBounds(x, y, z) {
        z = z || 0;
        this.minX = Math.min(this.minX, x);
        this.minY = Math.min(this.minY, y);
        this.minZ = Math.min(this.minZ, z);
        this.maxX = Math.max(this.maxX, x);
        this.maxY = Math.max(this.maxY, y);
        this.maxZ = Math.max(this.maxZ, z);
    }

    checkPoint(p) {
        this.checkBounds(p.x, p.y, p.z);
    }

    center() {
        return new Vector(this.minX + (this.maxX - this.minX) / 2,
            this.minY + (this.maxY - this.minY) / 2,
            this.minZ + (this.maxZ - this.minZ) / 2)
    }

    min() {
        return new Vector(this.minX, this.minY, this.minZ)
    }

    max() {
        return new Vector(this.maxX, this.maxY, this.maxZ)
    }

    width() {
        return this.maxX - this.minX;
    }

    height() {
        return this.maxY - this.minY;
    }

    depth() {
        return this.maxZ - this.minZ;
    }

    expand(delta) {
        this.minX -= delta;
        this.minY -= delta;
        this.minZ -= delta;
        this.maxX += delta;
        this.maxY += delta;
        this.maxZ += delta;
    }

    toPolygon() {
        return [
            new Vector(this.minX, this.minY, 0),
            new Vector(this.maxX, this.minY, 0),
            new Vector(this.maxX, this.maxY, 0),
            new Vector(this.minX, this.maxY, 0)
        ];
    }
}

function ConvexHull2D(points) {
    points.sort(function (a, b) {
        return a.x != b.x ? a.x - b.x : a.y - b.y;
    });

    const n = points.length;
    const hull = [];

    for (let i = 0; i < 2 * n; i++) {
        const j = i < n ? i : 2 * n - 1 - i;
        while (hull.length >= 2 && removeMiddle(hull[hull.length - 2], hull[hull.length - 1], points[j])) {
            hull.pop();
        }
        hull.push(points[j]);
    }
    hull.pop();
    return hull;
}

function removeMiddle(a, b, c) {
    var cross = (a.x - b.x) * (c.y - b.y) - (a.y - b.y) * (c.x - b.x);
    var dot = (a.x - b.x) * (c.x - b.x) + (a.y - b.y) * (c.y - b.y);
    return cross < 0 || cross == 0 && dot <= 0;
}

function polygonOffsetXY(polygon, scaleX, scaleY) {
    const origBBox = new BBox();
    const scaledBBox = new BBox();
    const result = [];
    for (let point of polygon) {
        const scaledPoint = new Vector(point.x * scaleX, point.y * scaleY);
        result.push(scaledPoint);
        origBBox.checkPoint(point);
        scaledBBox.checkPoint(scaledPoint);
    }
    const alignVector = scaledBBox.center()._minus(origBBox.center());
    for (let point of result) {
        point._minus(alignVector);
    }
    return result;
}

function polygonOffset(polygon, scale) {
    return polygonOffsetXY(polygon, scale, scale);
}