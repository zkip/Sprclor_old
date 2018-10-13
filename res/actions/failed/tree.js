class Tree {
    constructor(d) {
        let me = this;
        this.dom = d;
        // Index
        this.__ = {
            // TreeItem:number
            ti_idx: new Map(),
            // TreeItem.item:TreeItem
            tii_ti: new Map(),
            // TreeItem.dom:TreeItem
            tid_ti: new Map(),
        };
        // <TreeItem>Selection
        this.items = new SelectionEv().on("add-before", (_, ti, idx) => {
            let bItem = me.items.getByIndex(idx);
            me.dom.insertBefore(ti.dom, bItem && bItem.dom);
        }).on("add-after", (_, ti, idx) => {
            // 更新索引
            me.__.tid_ti.set(ti.dom, ti);
            me.__.tii_ti.set(ti.item, ti);
            me.__.ti_idx.set(ti, idx);
        }).on("move-after", (start, end) => {
            let d = me.dom.querySelector(`.Item:nth-of-type(${start+1})`);
            me.dom.removeChild(d);
            let endD = me.dom.querySelector(`.Item:nth-of-type(${end+1})`);
            me.dom.insertBefore(d, endD);
        });

        // 状态
        // <TreeItem>Selection
        this.selection = new SelectionEv().on("add-after", (_, ti, idx) => {
            ti.dom.classList.add("selected");
            // console.log(ti.dom, idx, me.items);
        }).on("clear-before", () => {
            me.selection.forEach((_, ti) => {
                ti.dom.classList.remove("selected");
            });
        })

        this.hoveredItem = null;

        let _ = document.createElement("style");
        this.dom.appendChild(_);
        let sty = _.sheet;
        let __ = sty.cssRules[sty.insertRule(`_ { margin-top: ${30}px; }`)];
        let ___ = sty.cssRules[sty.insertRule(`_ { pointer-events: none; }`)];
        let __dragItemSty = sty.cssRules[sty.insertRule(`.Tree>.Item.draging {}`)];
        let _margin = (c) => {
            __.selectorText = `.Tree>.Item:nth-of-type(${c+1})`;
        }
        this.dom.addEventListener("mousedown", e => {
            for (let i = 0; i < e.path.length; i++) {
                let item = me.__.tid_ti.get(e.path[i]);
                if (item) {
                    let len = me.items.len();
                    if (e.target === item.lock || e.target === item.hidden) return;

                    let rect = item.dom.getBoundingClientRect();
                    let ix = e.clientX,
                        iy = e.clientY,
                        paddingY = 30,
                        pos = (e.clientY - paddingY) / 30 >> 0,
                        start = pos;

                    let _ = true,
                        lastPos = -1,
                        _move = e => {
                            let mx = e.clientX - ix,
                                my = e.clientY - iy - paddingY;
                            pos = (e.clientY - paddingY) / 30 >> 0;
                            if (_) {
                                me.dom.classList.add("draging");
                                item.dom.classList.add("draging");
                                ___.selectorText = `*`;
                                _ = false;
                            }
                            if (lastPos !== pos) {
                                pos = pos < 0 ? 0 : pos;
                                pos = pos > len - 1 ? len - 1 : pos;
                                _margin(pos + (pos >= start ? 1 : 0));
                                lastPos = pos;
                            }
                            let ty = rect.y + my;
                            __dragItemSty.style.top = `${ty < 0 ? 0 : ty}px`;
                        },
                        _up = e => {
                            __.selectorText = `_`;
                            ___.selectorText = `_`;
                            me.dom.classList.remove("draging");
                            item.dom.classList.remove("draging");
                            if (pos !== start) {
                                me.items.move(start, pos);
                            }
                            me.selection.clear();
                            me.selection.appendOnce(me.items.getByIndex(pos));
                            removeEventListener("mousemove", _move);
                            removeEventListener("mouseup", _up);
                        }
                    addEventListener("mousemove", _move);
                    addEventListener("mouseup", _up);
                    break;
                }
            }
        });
    }
    hover(item) {
        if (this.hoveredItem !== item) {
            if (this.hoveredItem)
                this.hoveredItem.dom.classList.remove("hovered");

            if (item)
                item.dom.classList.add("hovered");

            this.hoveredItem = item;
        }
    }
}
class TreeItem {
    constructor(item, name) {
        let me = this;
        this._lock = false;
        this._hidden = false;
        this.item = item;
        this.dom = document.createElement("div");
        this.dom.classList.add("Item");
        let flag = document.createElement("span");
        flag.classList.add("flag");
        let info = document.createElement("div");
        info.classList.add("info");
        let nameD = document.createElement("span");
        nameD.classList.add("name");
        let lock = document.createElement("span");
        lock.classList.add("lock");
        let hidden = document.createElement("span");
        hidden.classList.add("hidden");
        if (item instanceof Group) {
            flag.textContent = "G";
        } else if (item instanceof Path) {
            flag.textContent = "P";
        } else if (item instanceof Text) {
            flag.textContent = "T";
        } else if (item instanceof Modifier) {
            flag.textContent = "M";
        }
        this.flag = flag;
        this.name = nameD;
        this.lock = lock;
        this.hidden = hidden;
        this.setName(name);
        this.dom.appendChild(flag);
        this.dom.appendChild(info);
        info.appendChild(nameD);
        info.appendChild(lock);
        info.appendChild(hidden);
        lock.addEventListener("mousedown", e => {
            me._lock = !me._lock;
            if (me._lock) {
                me.dom.classList.add("lock");
            } else {
                me.dom.classList.remove("lock");
            }
        });
        hidden.addEventListener("mousedown", e => {
            me._hidden = !me._hidden;
            if (me._hidden) {
                me.dom.classList.add("hidden");
                me.item.visible = false;
            } else {
                me.dom.classList.remove("hidden");
                me.item.visible = true;
            }
        });
        this.dom.addEventListener("mouseover", e => {
            me.item.selected = true;
        })
        this.dom.addEventListener("mouseout", e => {
            me.item.selected = false;
        })
    }
    setFlag() {
        // 
    }
    setName(n) {
        this.name.textContent = n;
    }
}