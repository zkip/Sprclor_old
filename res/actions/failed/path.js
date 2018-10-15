class Path extends paper.Path {
    constructor(a, b, c) {
        super(a, b, c);
        this.autoPivot = true;
        this.vPivot = new Vec();
    }
    applyPivotV() {
        this.autoPivot
    }
    getResetBounds() {
        let bounds = this._getBounds(new paper.Matrix(), {
            handler: false,
            stroke: false,
        });
        return bounds;
    }
}