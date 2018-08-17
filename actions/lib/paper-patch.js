let { Point,Matrix } = paper;
Object.assign(paper.View.prototype, {
    patch: function () {
        this._viewport = {
            x: 0,
            y: 0,
            zoom: 1,
        };
        this.__zoomCache={
            coefficientProduct: 1,  // 系数积
            offsetVec: new Point(),
        };
    },
    pMoveTo: function (/* Point */) {
        let p = paper.Point.read(arguments);
        
        this.matrix.tx = p.x;
        this.matrix.ty = p.y;
        this._viewport.x = p.x;
        this._viewport.y = p.y;
        return this;
    },
    pMoveBy: function (/* Point */) { },
    pZoomTo: function (zoom /*, center */) {
        let center = paper.Point.read(arguments, 1);
        let { x, y } = this._viewport;
        let m1=new Matrix();
        m1.scale(1-zoom);
        let innerCenter=m1._transformPoint(center);
        
        this.matrix.a = zoom;
        this.matrix.d = zoom;
        
        this.matrix.tx = innerCenter.x;
        this.matrix.ty = innerCenter.y;
        return this;
    },
    pZoomBy: function (v,/* Point */) {
        let center = paper.Point.read(arguments, 1);

        this.__zoomCache.coefficientProduct*=v;
        let p=center.multiply(this.__zoomCache.coefficientProduct);
        this.__zoomCache.offsetVec.add(p);
        
        this.matrix.a = zoom;
        this.matrix.d = zoom;

        this.matrix.tx=this._viewport.x+this.__zoomCache.offsetVec.x;
        this.matrix.ty=this._viewport.y+this.__zoomCache.offsetVec.y;

        return this;
    },
    getViewport() {
        return this._viewport;
    },
});