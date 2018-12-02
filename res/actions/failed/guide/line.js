{
    let proto = Path.Line.prototype;
    class Line extends Path.Line {
        constructor() {
            super();
            assign(this, new Guide);
            this.preValue.set("radius", 0);
        }
        onViewScaling(s) {
            let radius = this.preValue.get("radius");
            proto.setRadius.call(this, radius / s);
            this._updateSegments();
            return this;
        }
        setRadius(r) {
            proto.setRadius.call(this, r);
            this.preValue.set("radius", r);
            return this;
        }
    }
    assign(Line, Guide);
    Guide.Line = Line;
}