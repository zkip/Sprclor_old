{
    let proto = Path.Circle.prototype;
    class Circle extends Path.Circle {
        constructor() {
            super();
            assign(this, new Guide);
            assign(this,{
                canBreak: false,
            })
            this.preValue.set("radius", 0);
            this.preValue.set("center", new Vec);
            this.style.set({
                strokeScaling: false,
            });
        }
        onViewScaling(s) {
            let radius = this.preValue.get("radius");
            proto.setRadius.call(this, radius / (this.isFixed ? s : 1));
            this._update();
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
            proto.setCenter.call(this, this.mp.toGlobal(v)); // 由于canBreak:false造成vertex不会被变换矩阵作用，而center必须作用于变换矩阵
            return this;
        }
    }
    assign(Circle, Guide);
    Guide.Circle = Circle;
}