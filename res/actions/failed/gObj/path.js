delete paper.CompoundPath.prototype._hitTestChildren;
let Path; {
    let autoAlignFragment = (me, vxs) => {
        let len = me.children.length,
            n = vxs.length;
        if (len < n) {
            for (let i = 0; i < n - len; i++) {
                me.addChild(new Fragment);
            }
        } else if (len > n) {
            me.removeChildren(n);
        }
    }
    let proto = paper.CompoundPath;
    Path = class extends paper.CompoundPath {
        constructor() {
            super();
            assign(this, new GObj(this));
            assign(this, {
                frags: new Map(),
            });
        }
        smooth(opt) {
            let me = this;
            this.children.forEach(v => {
                v.smooth(opt);
                me.bfVertex.set(v, v.vertex);
            });
            return this;
        }
        flatten() {
            let me = this;
            let dest = [];
            let vxs = this.shape.vertex;
            let pos = this.mp.position.clone();
            this.mp.setPosition(new Vec);
            this.shape.forEach((_, v, idx) => {
                let vx = vxs[idx];
                let frt = me.children[idx];
                me.mp.getGlobal()._transformCoordinates(vx, dest, vx.length / 2 >> 0);
                v.vertex = dest;
                vxs[idx] = v.vertex;
                frt.vertex = dest;
            })
            this.mp.reset();
            this.mp.setPosition(pos);
            return this;
        }
        _update(idx) {
            let me = this;
            let shape = this.shape;
            let vxs = shape.vertex;
            autoAlignFragment(this, vxs);
            if (isUndefined(idx)) {
                this.children.forEach((v, i) => {
                    let dest = [];
                    let vx = vxs[i];
                    me.mp.getGlobal()._transformCoordinates(vx, dest, vx.length / 2 >> 0);
                    let frt = me.children[i];
                    frt.vertex = dest;
                    frt._update();
                })
            } else {
                let dest = [];
                let vx = vxs[idx];
                me.mp.getGlobal()._transformCoordinates(vx, dest, vx.length / 2 >> 0);
                let frt = me.children[idx];
                frt.vertex = dest;
                frt._update();
            }
        }
    }
    assign(Path, GObj, "extend");
}