{
    let proto = Path.Rect.prototype;
    class Rect extends Path.Rect {
        constructor() {
            super();
            assign(this, new Guide);
            assign(this,{
                canBreak: false,
            })
            this.preValue.set("radius", new Vec);
            this.preValue.set("center", new Vec);
            this.style.set({
                strokeColor: "red",
                strokeScaling: false,
            });
        }
        onViewScaling(s) {
            let radius = this.preValue.get("radius");
            proto.setRadius.call(this, radius.clone().multiply(1 / s));
            this._update();
        }
        setRadius(v) {
            this.preValue.get("radius").set(v);
            proto.setRadius.call(this, v);
            this.onViewScaling(this.uiView.getScaling());
            return this
        }
        setCenter(v){
            this.preValue.get("center").set(v);
            proto.setCenter.call(this, this.mp.toGlobal(v)); // 由于canBreak:false造成vertex不会被变换矩阵作用，而center必须作用于变换矩阵
            return this;
        }
    }
    assign(Rect, Guide);
    Guide.Rect = Rect;
}