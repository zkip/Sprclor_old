{
    let proto = Path.Rect.prototype;
    class Rect extends Path.Rect {
        constructor() {
            super();
            assign(this, new Guide);
            this.preValue.set("radius", new Vec);
            this.preValue.set("center", new Vec);
            this.style.set({
                strokeColor: "red",
                strokeScaling: false,
            });
            this.canBreak = false;
        }
        onViewScaling(s) {
            let radius = this.preValue.get("radius");
            proto.setRadius.call(this, radius.clone().multiply(1 / s));
            this._updateSegments();
        }
        setRadius(v) {
            this.preValue.get("radius").set(v);
            proto.setRadius.call(this, v);
            this.onViewScaling(this.uiView.getScaling());
            return this
        }
        setCenter(v){
            this.preValue.get("center").set(v);
            proto.setCenter.call(this, this.mp.toLocal(v));
            return this;
        }
    }
    assign(Rect, Guide);
    Guide.Rect = Rect;
}