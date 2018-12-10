let Group; {
    let proto = paper.Group.prototype;
    Group = class Group extends paper.Group {
        constructor(...arg) {
            super(...arg);
            assign(this, new GObj(this));
            this.shape = null;
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
            this.setTopParent(this);
            child._update && child._update();
            return this;
        }
        _update() {
            console.log("object");
            this.children.forEach(v => {
                v._update && v._update();
            })
            return this;
        }
    }
    assign(Group, GObj, "extend");
}