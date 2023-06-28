import paper from "paper";

let Vec = paper.Point;
let Matrix = paper.Matrix;
let Bounds = paper.Rectangle;
let Layer = paper.Layer;
let Segment = paper.Segment;

/*
    # GObj 图形对象
        ## 形状
            图形对象的形状使用向量的方式进行表达，origin是起点，vertex扁平存储所有的控制点
            使用无关位置信息的一组向量集来表达一个形状
            e.g
                [
                    -5,-5,
                    5,-5,
                    5,5,
                    -5,5,
                ]
                上面会呈现一个正方形
*/
export class GObj {
    constructor(owner) {
        assign(this, {
            shape: new paper.Shape,
            canApplyMatrix: true, // 是否允许被父级以及自身的变换矩阵影响
            autoPivot: true,
            topParent: null,
            bfVertex: new Map(),
            mp: new MatrixProxy(owner),
            getOwner: () => owner,
        });
        this.setShape(this.shape);
    }
    setCenter() {
        let v = Vec.read(arguments);
        let pos = this.mp.getParent().toLocal(v);
        this.mp.position.set(v);
        this.mp.setTranslation(pos.negate());
        return this;
    }
    setShape(shape) {
        let me = this;
        this.shape = shape;
        this.shape.on("updated", (idx) => {
            me.getOwner()._update(idx);
        })
        return this;
    }
    setTopParent(parent) {
        this.topParent = parent;
        return this;
    }
    getResetBounds() {
        let bounds = this._getBounds(this.mp.getGlobal().inverted(), {
            handle: false,
            stroke: false,
        });
        return bounds.rect;
    }
    getGlobalBounds() {
        return this._getBounds(new Matrix(), {
            handle: false,
            stroke: false,
        }).rect;
    }
    _update() {
        this.getOwner()._update();
        return this;
    }
}

export class MatrixProxy {
    constructor(owner) {
        let addtion = new Matrix();
        let base = new Matrix();
        assign(this, {
            getOwner: () => owner,
            // get/getLocal
            get: () => base.appended(addtion),
            getBase: () => base,
            getAddtion: () => addtion,
            translation: new Vec,
            rotation: 0,
            scaling: new Vec(1, 1),
            position: new Vec,
            _bk: null,
        });
    }
    setBase(...arg) {
        this.getBase().set(...arg);
        this.getOwner()._update();
        return this;
    }
    setAddtion(...arg) {
        this.getAddtion().set(...arg);
        this.getOwner()._update();
        return this;
    }
    getGlobal() {
        let parent = this.getParent();
        let m = new Matrix;
        parent && m.append(parent.getGlobal());
        m.append(this.get());
        return m;
    }
    getParent() {
        let owner = this.getOwner();
        return owner && owner.parent && owner.parent.mp;
    }

    apply() {
        // 
        return this;
    }
    // Local参考至父级空间，参考点为ResetBounds的center
    _updateLocal() {
        let m = new Matrix();
        m.translate(this.position);
        m.rotate(this.rotation);
        m.scale(this.scaling);
        m.translate(this.translation);
        this.getBase().set(m);
        this.getOwner()._update();
    }
    setCenter() {
        let v = Vec.read(arguments);
        let pos = v.subtract(this.position);
        this.position.set(v);
        this.translation.set(new Vec);
        this.getAddtion().translate(pos.negate());
        this._updateLocal();
        return this;
    }
    setTranslation() {
        let v = Vec.read(arguments);
        this.translation.set(v);
        this._updateLocal();
        this._bk && (this._bk = null);
        return this;
    }
    getTranslation() {
        return this.translation;
    }
    setPosition() {
        let v = Vec.read(arguments);
        this.position.set(v);
        this._updateLocal();
        this._bk && (this._bk = null);
        return this;
    }
    getPosition() {
        return this.position;
    }
    setRotation(r) {
        this.rotation = r;
        this._updateLocal();
        this._bk && (this._bk = null);
        return this;
    }
    getRotation() {
        return this.rotation;
    }
    setScaling() {
        let v = Vec.read(arguments);
        this.scaling.set(v);
        this._updateLocal();
        this._bk && (this._bk = null);
        return this;
    }
    getScaling() {
        return this.scaling;
    }


    // 本级坐标空间影响自己的子级
    scale(...arg) {
        this.getAddtion().scale(...arg);
        this.getOwner()._update();
        return this;
    }
    translate(...arg) {
        this.getAddtion().translate(...arg);
        this.getOwner()._update();
        return this;
    }
    rotate(...arg) {
        this.getAddtion().rotate(...arg);
        this.getOwner()._update();
        return this;
    }
    skew(...arg) {
        this.getAddtion().skew(...arg);
        this.getOwner()._update();
        return this;
    }
    shear(...arg) {
        this.getAddtion().shear(...arg);
        this.getOwner()._update();
        return this;
    }

    append(...arg) {
        this.getAddtion().append(...arg);
        return this;
    }
    prepend(...arg) {
        this.getAddtion().prepend(...arg);
        return this;
    }
    invert(...arg) {
        this.getAddtion().invert(...arg);
        return this;
    }

    appended(...arg) {
        return this.get().appended(...arg);
    }
    prepended(...arg) {
        return this.get().prepended(...arg);
    }
    inverted(...arg) {
        return this.get().inverted(...arg);
    }

    decompose() {
        return this.get().decompose();
    }
    getDeScaling() {
        return this.get().getScaling();
    }
    getDeRotation() {
        return this.get().getRotation();
    }
    getDeTranslation() {
        return this.get().getTranslation();
    }

    reset() {
        // this.position.set(new Vec);
        this.scaling.set(new Vec(1, 1));
        this.translation.set(new Vec);
        this.rotation = 0;
        this.getBase().reset();
        this.getAddtion().reset();
        this.getOwner()._update();
        return this;
    }

    toGlobal() {
        let v = Vec.read(arguments);
        let ret = new Vec();
        let dest = [];
        let m = this.getGlobal();
        m._transformCoordinates([v.x, v.y], dest, 1);
        ret.set(dest[0], dest[1]);
        return ret;
    }
    toLocal() {
        let v = Vec.read(arguments);
        let ret = new Vec();
        let dest = [];
        let m = this.getGlobal().inverted();
        m._transformCoordinates([v.x, v.y], dest, 1);
        ret.set(dest[0], dest[1]);
        return ret;
    }

    clone(owner) {
        let mp = new MatrixProxy(this.getOwner());
        mp.translation.set(this.translation)
        mp.rotation = this.rotation;
        mp.position.set(this.position);
        mp.scaling.set(this.scaling);
        mp._updateLocal();
        return mp;
    }
}

export class Guide {
    constructor() {
        assign(this, {
            uiView: null,
            preValue: new Map(),
            isFixed: true,
            ev: new MEvent("viewScaling"),
        });
    }
    init(v) {
        this.uiView = v;
        this.uiView.mEvent.transmit(this.ev);
        return this;
    }
}