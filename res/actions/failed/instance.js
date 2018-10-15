class Instance {
    constructor(opt) {
        this.name = "Instance";
        this.tree = null;
        this.inspector = null;
        this.workspace = null;
        this.paper = null;
        this.set(opt);
    }
    set(opt) {
        this.tree = opt.tree || null;
        this.inspector = opt.inspector || null;
        this.workspace = opt.workspace || null;
        this.paper = paper || null;
        return this;
    }
    init() {
        let cvs = document.createElement("canvas");
        this.workspace.dom.appendChild(cvs);
        let work = this.workspace.dom;
        this.paper.setup(cvs);
        let {
            view,
            project,
            Layer,
        } = this.paper;
        let {
            random,
            abs,
            tan,
            sin
        } = Math;
        let objl = project.activeLayer;
        let oprl = new Layer();
        this.workspace.oprLayer = oprl;
        this.workspace.objectLayer = objl;
        project.addLayer(oprl);

        this.tree.items.on("move-after", (start, end) => {
            let len = this.tree.items.len();
            objl.move(len - start - 1, len - end - 1);
        })

        let oftRect = cvs.getBoundingClientRect();
        let ox = oftRect.left,
            oy = oftRect.top;
        let scs = [0.2, 0.4, 0.8, 0.9, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1];

        let resize = function () {
            let w = work.offsetWidth,
                h = work.offsetHeight;
            cvs.width = w;
            cvs.height = h;
            view.viewSize.set(w, h);
        }
        resize();
        addEventListener("resize", resize);
        addEventListener("wheel", (e) => {
            let {
                deltaY,
                clientX,
                clientY
            } = e;
            let p = view.viewToProject(clientX - ox, clientY - oy);
            let v = deltaY / 100;
            v = v > 5 ? 5 : v;
            v = v < -5 ? -5 : v;

            view.scale(1 - v * scs[abs(v) - 1] * 0.15, p);
        })

        let isT = false;
        addEventListener("keydown", (e) => {
            if (e.code === "Space") {
                isT = true;
            }
        })
        addEventListener("keyup", (e) => {
            if (e.code === "Space") {
                isT = false;
            }
        })

        addEventListener("mousedown", (e) => {
            if (isT || e.button === 1) {
                let ix = view.matrix.tx,
                    iy = view.matrix.ty;
                let {
                    clientX: sx,
                    clientY: sy
                } = e;
                let fn1 = (e) => {
                    let {
                        clientX,
                        clientY
                    } = e;
                    view.matrix.tx = ix + (clientX - sx);
                    view.matrix.ty = iy + (clientY - sy);
                };
                let fn2 = (e) => {
                    removeEventListener("mousemove", fn1);
                    removeEventListener("mouseup", fn2);
                };
                addEventListener("mousemove", fn1);
                addEventListener("mouseup", fn2);
            }
        })
        return this;
    }
}