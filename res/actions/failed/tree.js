class Tree {
    constructor(d) {
        let me = this;
        this.dom = d;
        // Index
        // <TreeItem,TreeItem.item,TreeItem.dom>
        this.__ = new SingleSideIndex();
        // <TreeItem>Selection
        this.items = new SelectionEv().on("add-before", (_, ti, idx) => {
            let bItem = me.items.getByIndex(idx);
            me.dom.insertBefore(ti.dom, bItem && bItem.dom);
        }).on("add-after", (_, ti, idx) => {
            me.__.add([ti, ti.item, ti.dom], idx);
        }).on("rm-after", (_, ti, idx) => {
            me.__.rm(ti);
        }).on("move-after", (start, end) => {
            let d = me.dom.querySelector(`.Item:nth-of-type(${start+1})`);
            me.dom.removeChild(d);
            let endD = me.dom.querySelector(`.Item:nth-of-type(${end+1})`);
            me.dom.insertBefore(d, endD);
            me.__.move(start, end);
        });

        // 状态
        // <TreeItem>Selection
        this.selection = new SelectionEv().on("add-after", (_, ti) => {
            ti.dom.classList.add("selected");
            ti.item.selected = true;
            ti.selected = true;
        }).on("rm-after", (_, ti) => {
            ti.dom.classList.remove("selected");
            ti.item.selected = false;
            ti.selected = false;
        }).on("clear-before", () => {
            me.selection.forEach((_, ti) => {
                ti.dom.classList.remove("selected");
                ti.item.selected = false;
                ti.selected = false;
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

        let lastSelectIdx = 0;
        this.dom.addEventListener("mousedown", e => {
            for (let i = 0; i < e.path.length; i++) {
                let [ti, item, dom] = me.__.get(e.path[i]);
                if (item) {
                    let len = me.items.len();
                    let {
                        ctrlKey,
                        shiftKey
                    } = e;
                    if (e.target === item.lock || e.target === item.hidden) return;
                    let rect = dom.getBoundingClientRect();
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
                                dom.classList.add("draging");
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
                            dom.classList.remove("draging");
                            if (pos !== start) {
                                me.items.move(start, pos);
                                me.selection.clear();
                                me.selection.append(ti);
                                lastSelectIdx = pos;
                            } else {
                                if (!ctrlKey && !shiftKey) {
                                    me.selection.clear();
                                    me.selection.append(ti);
                                } else if (ctrlKey) {
                                    if (me.selection.exist(ti)) {
                                        me.selection.rmByValue(ti);
                                    } else {
                                        me.selection.append(ti);
                                    }
                                } else if (shiftKey) {
                                    me.selection.clear();
                                    let max, min;
                                    lastSelectIdx > pos ? (max = lastSelectIdx, min = pos) : (max = pos, min = lastSelectIdx);
                                    for (let i = min; i <= max; i++) {
                                        let ti = me.items.getByIndex(i);
                                        me.selection.append(ti);
                                    }
                                }
                                if (!shiftKey) {
                                    lastSelectIdx = pos;
                                }
                            }
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
        this.selected = false;
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
            me.selected || (me.item.selected = true);
        })
        this.dom.addEventListener("mouseout", e => {
            !me.selected && (me.item.selected = false);
        })
    }
    setFlag() {
        // 
    }
    setName(n) {
        this.name.textContent = n;
    }
}