class Renderer extends Base {
    constructor(data) {
        super();
        this.data = data;
    }
    // Drawable:
    add(da) {

    }
    render() {}
}

class PaperRenderer extends Renderer {
    constructor(data, paper) {
        super(data);
        this.paper = paper;
        let _ = new Loki();
        this._ = {
            path: _.addCollection("path"),
        };
    }
    add(p) {
        let sty = this.data.getStyle(p);
        p._.segments.find().each(seg => {
            let pp = new this.paper.Path(PaperRenderer.getPPOFromStyle(sty));
            let start = seg.A(),
                end = seg.B();
            let _seg = seg;
            pp.moveTo(start);
            while (_seg) {

                _seg = seg.next();
            }
            switch (getType(seg)) {
                case Segment.Line:
                    {
                        let start = seg.A(),
                            end = seg.B();
                        pp.moveTo(start);
                        pp.lineTo(end);
                    }
                    break;
                case Segment.Curve.Bezier:
                    {
                        let [hv1, hv2] = seg.handler();
                        let hv1L = hv1.len(),
                            hv2L = hv2.len();
                        if (!(hv1L + hv2L)) {
                            pp.lineTo(end);
                        } else if (!(hv1L * hv2L)) {
                            if (!hv1L) {
                                pp.quadraticCurveTo(
                                    Point.fromVector(end, hv2)[0],
                                    end
                                );
                            } else {
                                pp.quadraticCurveTo(
                                    Point.fromVector(start, hv1)[0],
                                    end
                                );
                            }
                        } else {
                            pp.cubicCurveTo(
                                Point.fromVector(start, hv1)[0],
                                Point.fromVector(end, hv2)[0],
                                end
                            );
                        }
                    }
                    break;
                default:
                    {};
            }
            this._.path.insert({
                path: p,
                segment: seg,
            });
        });
    }
    update(da) {

    }
}
// Style : PaperPathOpt
PaperRenderer.getPPOFromStyle() {}

class Style extends Base {
    constructor() {
        this.lineCap = 0x0;
        this.lineWidth = 0;
    }
}

class Draw extends Base {
    constructor(p) {
        this.path = p;
        this.lineWidth = 0;
        this.lineJoin = 0x0;
        this.lineCap = 0x0;
        this.strokeColor = new Color();
        this.fillColor = new Color();
    }
}