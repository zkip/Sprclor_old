{
    let proto = Path.Circle.prototype;
    class Circle extends Path.Circle {
        constructor() {
            super();
            assign(this, new Guide);
            this.preValue.set("radius", 0);
            this.preValue.set("center", new Vec);
            this.style.set({
                strokeColor: "red",
                fillColor: "blue",
                strokeScaling: false,
            });
            this.canBreak = false;
        }
        onViewScaling(s) {
            let radius = this.preValue.get("radius");
            proto.setRadius.call(this, radius / s);
            this._updateSegments();
            return this;
        }
        setRadius(r) {
            this.preValue.set("radius", r);
            proto.setRadius.call(this, r);
            this.onViewScaling(this.uiView.getScaling());
            return this;
        }
        setCenter(v) {
            this.preValue.get("center").set(v);
            proto.setCenter.call(this, this.mp.toLocal(v));
            return this;
        }
    }
    assign(Circle, Guide);
    Guide.Circle = Circle;
}