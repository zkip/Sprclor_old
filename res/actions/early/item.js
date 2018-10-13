class Point extends Base {
    constructor(x, y) {
        super();
        this.set(x, y);
    }
    set() {
        return Vector.prototype.set.apply(arguments);
    }
}
// Point : Vector
Point.toVector = (p) => {
    return new Vector(p.x, p.y);
}

// Point,...Vector : []Point
Point.fromVector = (base, ...vs) => {
    let pV = new Vector();
    return vs.forEach(v => {
        pV = pV.add(v);
        return new Point(pV.add(base));
    });
}

// EventObj : Point
Point.fromEventObj = (e) => {
    return new Point(e.clientX, e.clientY);
};

// Point,Point : Vector
Point.toVectorBy2P = (p1, p2) => {
    return new Vector(p2.x - p1.x, p2.y - p1.y);
}

class Item extends Base {
    constructor(t) {
        super();
        this.type = t;
    }
    // @
    showBefore() {}
}

class Segment extends Base {
    constructor(t) {
        super();
        this.type = t || "Segment";
        this.ctlps = []; // control points
        this._isPathed = false; // 是否已在路径中
    }
    // @sg A端 线段的开始端点
    A(v) {}
    // @sg B端 线段的结束端点
    B(v) {}
}

class Line extends Segment {
    constructor(p1, p2) {
        super("Line");
        this.A(p1);
        this.B(p2);
    }
    A(v) {
        if (checkType(v, Point))
            this.ctlps[0] = v;
        else
            return this.ctlps[0];
    }
    B(v) {
        if (checkType(v, Point))
            this.ctlps[1] = v;
        else
            return this.ctlps[1];
    }
}
Segment.Line = Line;

class Curve extends Segment {
    constructor() {
        super("Curve");
        this._handlerPts = [];
    }
    handlers() {}
}
Segment.Curve = Curve;

// 三次贝塞尔曲线
class Bezier extends Curve {
    // Point,Point,Vector,Vector
    constructor(lkp1, lkp2, hv1, hv2) {
        super();
        this.A(lkp1);
        this.B(lkp2);
        this.handler(hv1, hv2);
        this._handlerIn = new Vector();
        this._handlerOut = new Vector();
        this._isQuadratic = false;
    }
    A(v) {
        if (checkType(v, Point))
            this.ctlps[0] = v;
        else
            return this.ctlps[0];
    }
    B(v) {
        if (checkType(v, Point))
            this.ctlps[3] = v;
        else
            return this.ctlps[3];
    }
    // sg (Vector,*Vector)/(,Vector) / : [Vector,Vector]
    handler() {
        let v1 = arguments[0],
            v2 = arguments[1];
        let c = 0;

        checkType(v1, Vector) && (this._handlerIn.set(v1), c++);
        checkType(v2, Vector) && (this._handlerOut.set(v2), c++);
        if (c > 0) {
            this.ctlps[1].set(Point.fromVector(this.ctlps[0], this._handlerIn)[0]);
            this.ctlps[2].set(Point.fromVector(this.ctlps[3], this._handlerOut)[0]);
        } else
            return [this._handlerIn, this._handlerOut];
    }
    // sg (Point,*Point)/(,Point) / : [Point,Point]
    handlerByPoint() {
        let p1 = arguments[0];
        let p2 = arguments[1];
        let c = 0;
        checkType(p1, Point) && (this.ctlps[1].set(p1), c++);
        checkType(p2, Point) && (this.ctlps[2].set(p2), c++);
        if (c > 0) {
            let p0 = this.ctlps[0],
                p3 = this.ctlps[3];
            this._handlerIn && this._handlerIn.set(
                Point.toVector(p0).subtract(Point.toVector(p1))
            );
            this._handlerOut && this._handlerOut.set(
                Point.toVector(p3).subtract(Point.toVector(p2))
            );
        } else
            return [this.ctlps[1], this.ctlps[2]];
    }
}
Curve.Bezier = Bezier;

// 区域
class Area extends Base {
    constructor() {
        super();
        this.type = "Area";
        this.loop = []; // 构成Area的轮廓
    }
}

/* 
[概念]
    Path 包括了 Point Segment Area
    Point 是基础设施
    Segment 建立在点的基础上
    Area 是 Segment 组成的封闭区域，形成 Area 的必要充分条件是 SegmentCount>=2 && SegmentCount==PointCount

[定义]
    Const Geometry.Ubiety {
        Edge // 边缘
        InSide // 内部
        OutSide // 外部
    }

    option hitOpt {
        Area bool // 是否将区域中会视为击中
    }

    interface Path {
        getPoints( GetPointOpt ) []Point
        getSegments( GetSegmentOpt ) []Segment
        getAdjacentSegments( Segment Point ) []Segment // 获取相邻边
        getSegmentsByPoint( Point ) []Segment // 获得连结至该点的所有线
        link( Point Point Segment ) me // 将两点用线连接起来
        unlink( Segment ) me // 解除该Segment的连接并从Path中删除

        isHit( point *hitOpt ) Geometry.Ubiety // 是否击中
    }

[特殊情况]
    1. 当点被移除，与之关联的线段也会被随之移除

[标准]
    实现发明自 https://www.figma.com 的 Vector Network

[目标]
    便于查找：
        1. 相邻边，方向由点来确定               ]- getAdjacentSegments( Segment , Point ) : Segment
        2. 由点找边，找到所有与该点有连结的边    ]- getSegments( Point ) : []Segment
*/
class Path extends Item {
    constructor() {
        super("Path");
        let _ = new Loki();
        this._ = {
            Points: _.addCollection("Points"),
            Segments: _.addCollection("Segments"),
            Areas: _.addCollection("Areas"),
        };
    }
    /*  获取点
        1. 通过最大距离获取范围内所有点
            position:Point ]] 参照原点
            near:number ]] 选取范围
            [ 附加选项 ]
                count:int ]] 最大接受的结果数量
                order:NumberOrder ]] 排序方式
        2. 通过Segment获得与Segment相关联的点
        3. 获得所有的点
        option GetPointOpt {
            [ position:Point near:number *count:int ] /
            [ seg:Segment ]
        }
        option GetSegmentOpt {
            [ position:Point near:number ] /
            [ point:Point ] /
            [ ]
        }
    */
    // GetPointOpt : []Point
    getPoints(opt) {
        if (!opt) {
            return this._points.find().map(d => {
                return d.pt
            });
        }
        let {
            position,
            near,
            segment,
        } = opt;
        if (!isUndefined(position, near)) {
            return this._.Points.where((d) => {
                let {
                    pt
                } = d;
                let vec = Point.toVector(pt);
                let origin = new Vector(position.x, position.y);
                return vec.subtract(origin).len() <= near;
            }).map(d => {
                return d.pt
            })
        } else if (!isUndefined(segment)) {
            return this._point_segment({
                seg: {
                    "$eq": segment
                },
            }).map(d => {
                return d.pt
            })
        } else if (!isUndefined(linkCount)) {
            return this._points.find({
                linkCount: {
                    "$eq": linkCount,
                }
            }).map(d => {
                return d.pt
            })
        }
        return [];
    }
    // GetSegmentOpt : []Segment
    getSegments(opt) {
        if (!opt) {
            return this._.Segments.find().map(d => {
                return d.seg
            })
        }
        return [];
    }

    // 获取相邻边
    // Segment,Point : []Segment
    getAdjacentSegments(seg, ...p) {}

    // 通过点获取与该点有连结的所有边
    // Point : []Segment
    getSegmentsByPoint(p) {}

    getSegmentByPosition() {}

    // 添加结点
    // Point : me
    addPoint(p) {
        if (this._.Points.find({
                pt: {
                    "$eq": p
                }
            }).length > 0) {
            return this;
        }
        this._.Points.insert({
            pt: p,
            linkCount: 0,
        })
        return this;
    }

    /* 移除点，拆除基础设施时，建立在其上的设备会受到影响
        会拆除相关的Segment
        判断影响的Loop Segment是否仍然构成，如果Loop被破坏，相应的Areas也会被移除
    */
    // Point : me
    rmPoint(p) {
        this._.Points.findAndRemove({
            pt: {
                "$eq": p
            },
        });
        this._point_segment.findAndRemove({
            pt: {
                "$eq": p
            },
        });
        return this;
    }

    // 连接两个点
    // Point Point Segment : me
    link(p1, p2, seg) {
        // 避免两个相同的点
        if (p1 === p2) {
            return this;
        }
        // 避免重复插入
        if (this._.Segments.where((t) => {
                return t.seg === seg && t.pt === p1 || t.pt === p2;
            }).length > 0) { // len===2
            return this;
        }
        if (!seg._isPathed) {
            this._.Segments.insert({
                pt: p1,
                seg: seg,
            });
            this._.Segments.insert({
                pt: p2,
                seg: seg,
            });
            this._.Points.updateWhere((d) => {
                return d.point === p1 || d.point === p2
            }, (d) => {
                d.linkCount++;
            })
            seg.A(p1);
            seg.B(p2);
            seg._isPathed = true;
        }
        return this;
    }

    // 取消连结
    unlink(seg) {
        this._point_segment.findAndRemove({
            seg: {
                "$eq": seg,
            }
        })
        this._points.updateWhere((d) => {
            return d.point === p1 || d.point === p2
        }, (d) => {
            d.linkCount--;
        })
        seg._isPathed = false;
        return this;
    }
}
Path.SegmentType = GenConst(
    "Line",
    "Curve",
);

class Rect extends Path {
    constructor() {
        super("Rect");
        this.width = 0;
        this.height = 0;
    }
}
Path.Rect = Rect;