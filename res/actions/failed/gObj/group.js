let Group; {
    let proto = paper.Group.prototype;
    Group = class Group extends paper.Group {
        constructor(...arg) {
            super(...arg);
            assign(this, new GObj(this));
        }
        setTopParent(parent) {
            this.children.forEach(v => {
                v.setTopParent(parent);
            })
            return this;
        }
        addChild(child) {
            if (child instanceof Guide) {
                paper.Group.prototype.addChild.call(this, child);
            } else if (child instanceof Tool) {
                child.guides.get("root", (k, v) => {
                    paper.Group.prototype.addChild.call(this, v);
                })
            } else {
                paper.Group.prototype.addChild.call(this, child);
            }
            this.mp.center.set(this.getResetBounds().center);
            this.setTopParent(this);
            child._updateSegments && child._updateSegments();
            return this;
        }
        // _draw(ctx, param, viewMatrix, strokeMatrix) {
        //     paper.Group.prototype._draw.call(this, ctx, param, viewMatrix, strokeMatrix);
        // }
    }
    assign(Group, GObj, "extend");
}