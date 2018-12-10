class Line extends Path {
    constructor(a, b) {
        super();
        this.setShape(new Shape.Line());
        a && this.shape.setCA(a);
        b && this.shape.setCB(b);
    }
}
Path.Line = Line;