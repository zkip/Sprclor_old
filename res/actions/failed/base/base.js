let Vec = paper.Point;
let Matrix = paper.Matrix;
let Bounds = paper.Rectangle;
let Layer = paper.Layer;
let Segment = paper.Segment;

class Inster {
    constructor(name) {
        this.name = name;
        this._ins = null;
    }
    setIns(ins) {
        this._ins = ins;
        return this;
    }
    getIns() {
        return this._ins;
    }
    init() {}
}
class UI extends Inster {
    constructor(name, d) {
        super(name);
        assign(this, {
            dom: d,
        });
    }
    add(d) {
        if (d instanceof HTMLElement) {
            this.dom.append(d);
        } else {
            this.dom.append(d.dom);
        }
        return this;
    }
}

class Tool extends Inster {
    constructor(name) {
        super(name);
        assign(this, {
            guides: new TagIdx,
            keyg: new Map,
            flag: new Map,
            data: new Map,
            mEvent: new MEvent("on", "off"),
        })
    }
    _init() {
        let ins = this.getIns(),
            view = ins.ui.get("view");
        let root = new Group();
        this.setGuidesData(root, "root");
        this.keyg.set("root", root);
        this.flag.set(root, "root");
        view.addChildren(root, "opr");
        this.initGuides();
        this.init();
    }
    // @
    initGuides() {}
    // @
    init() {}
    setGuidesData(item, sub, cus) {
        let d = {
            type: this.name,
        };
        if (sub) {
            d.sub = sub;
        }
        if (cus) {
            for (let i in cus) {
                d[i] = cus[i];
            }
        }
        this.data.set(item, d);
        this.guides.put(sub, item);
        return this;
    }
    hiddenGuides() {
        this.keyg.get("root").visible = false;
        return this;
    }
    showGuides() {
        this.keyg.get("root").visible = true;
        return this;
    }
    getGuidesData(item) {
        return this.data.get(item);
    }
}

/*
    GObj的坐标空间由mp决定，自身的所有点作为自己的子级，而children都是子空间
*/
class GObj {
    constructor(owner) {
        assign(this, {
            coordMatrix: new Matrix(),
            autoComputed: false,
            autoPivot: true,
            mPivot: new Vec,
            topParent: null,
            applyMatrix: false,
            canBreak: true,
            matrix: new Matrix,
            mp: new MatrixProxy(owner),
        });
    }
    setPivot(v) {
        this.mPivot.set(v);
        return this;
    }
    getPivot() {
        return this.mPivot;
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
    globalToLocal(v) {
        let ret = new Vec();
        let dest = [];
        let m = this.mp.getGlobal();
        // m = m.invert();
        m._transformCoordinates([v.x, v.y], dest, 1);
        ret.set(dest[0], dest[1]);
        return ret;
    }
    // getCoordMatrix() {
    //     let m = this.coordMatrix.clone();
    //     if (this.parent) {
    //         let fn = this.parent.getCoordMatrix;
    //         fn && (m.append(fn.call(this.parent)));
    //     }
    //     return m;
    // }
    // getGlobalMatrixM() {
    //     let m = new Matrix();
    //     m.append(this.globalMatrix);
    //     m.append(this.getCoordMatrix());
    //     return m;
    // }
    getGlobalBounds() {
        let m = new Matrix();
        m.append(this.globalMatrix);
        m.append(this.coordMatrix);
        return this._getBounds(m, {
            handle: false,
            stroke: false,
        }).rect;
    }
    _updateSegments() {
        let me = this;
        this.children.forEach(v => {
            v._updateSegments && v._updateSegments();
        })
        return this;
    }
}

class MatrixProxy {
    constructor(owner) {
        let matrix = new Matrix();
        assign(this, {
            getOwner: () => owner,
            // get/getLocal
            get: () => matrix,
            position: new Vec,
            rotation: 0,
            scaling: new Vec(1, 1),
            center: new Vec,
        });
    }
    set(...arg) {
        this.get().set(...arg);
        this.getOwner()._updateSegments();
        return this;
    }
    getGlobal() {
        let owner = this.getOwner();
        let m, parent = owner.parent;
        if (parent && parent.mp) {
            m = parent.mp.getGlobal();
        } else {
            m = new Matrix();
        }
        m.append(this.get());
        return m;
    }

    // Local参考至父级空间，参考点为ResetBounds的center
    _updateLocal() {
        let m = this.parent ? this.parent.getGlobal() : new Matrix();
        m.translate(this.center);
        m.rotate(this.rotation);
        m.scale(this.scaling);
        m.translate(this.position);
        this.get().set(m);
        this.getOwner()._updateSegments();
    }
    setCenter() {
        let v = Vec.read(arguments);
        this.center.set(v);
        this._updateLocal();
        return this;
    }
    getCenter() {
        return this.center;
    }
    setPosition() {
        let v = Vec.read(arguments);
        this.position.set(v);
        this._updateLocal();
        return this;
    }
    getPosition() {
        return this.position;
    }
    setRotation(r) {
        this.rotation = r;
        this._updateLocal();
        return this;
    }
    getRotation() {
        return this.rotation;
    }
    setScaling() {
        let v = Vec.read(arguments);
        this.scaling.set(v);
        this._updateLocal();
        return this;
    }
    getScaing() {
        return this.scaling;
    }


    // 本级坐标空间影响自己的子级
    scale(...arg) {
        this.get().scale(...arg);
        this.getOwner()._updateSegments();
        return this;
    }
    translate(...arg) {
        this.get().translate(...arg);
        this.getOwner()._updateSegments();
        return this;
    }
    rotate(...arg) {
        this.get().rotate(...arg);
        this.getOwner()._updateSegments();
        return this;
    }
    skew(...arg) {
        this.get().skew(...arg);
        this.getOwner()._updateSegments();
        return this;
    }
    shear(...arg) {
        this.get().shear(...arg);
        this.getOwner()._updateSegments();
        return this;
    }

    append(...arg) {
        this.get().append(...arg);
        return this;
    }
    prepend(...arg) {
        this.get().prepend(...arg);
        return this;
    }
    invert(...arg) {
        this.get().invert(...arg);
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
    getScaling() {
        return this.get().getScaling();
    }
    getRotation() {
        return this.get().getRotation();
    }
    getTranslation() {
        return this.get().getTranslation();
    }

    reset() {
        this.get().reset();
        this.getOwner()._updateSegments();
        return this;
    }

    toLocal(v) {
        let ret = new Vec();
        let dest = [];
        let m = this.getGlobal();
        m._transformCoordinates([v.x, v.y], dest, 1);
        ret.set(dest[0], dest[1]);
        return ret;
    }
}

class Guide {
    constructor() {
        assign(this, {
            uiView: null,
            preValue: new Map(),
        });
    }
    init(v) {
        let me = this;
        this.uiView = v;
        this.uiView.mEvent.add("viewScaling", s => me.onViewScaling(s));
    }
}