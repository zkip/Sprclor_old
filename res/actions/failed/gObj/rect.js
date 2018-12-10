{
    let _ = [
        new Vec(-1, -1),
        new Vec(1, -1),
        new Vec(1, 1),
        new Vec(-1, 1),
    ];
    class Rect extends Path {
        constructor(radius) {
            super();
            assign(this, {
                autoComputed: true,
            });
            this.setShape(new Shape.Rect());
            this.shape.setRadius(radius);
            this.closed = true;
        }
    }
    Path.Rect = Rect;
}
let Rect = Path.Rect;