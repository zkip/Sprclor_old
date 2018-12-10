let Circle; {
    Circle = class extends Path {
        constructor(radius) {
            super();
            let me = this;
            assign(this, {
                closeCap: true,
            })
            this.setShape(new Shape.Circle());
            this.shape.on("updated", () => {
                let t = this.shape.getSpecType();
                let main = me.children[0];
                if (!me.closeCap && t === "Arc") {
                    main.closed = false;
                } else {
                    main.closed = true;
                }
                if (t === "Ring") {
                    let sub = me.children[1];
                    sub.closed = true;
                    this.fillRule = "evenodd";
                }
            })
            this.shape.setRadius(radius);
        }
    }
    Path.Circle = Circle;
}