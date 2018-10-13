class Path extends paper.Path {
    constructor(a, b, c) {
        super(a, b, c);
        this.autoPivot = true;
    }
    getResetBounds() {
        let bounds = this._getBounds(new paper.Matrix(), {
            handler: false,
            stroke: false,
        });
        return bounds;
    }
}