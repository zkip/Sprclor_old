{
    // 辅助工具
    class Flag extends Tool {
        constructor() {
            super("Flag");
        }
        initGuides() {
            let ins = this.getIns(),
                view = ins.ui.get("view");
            let root = this.keyg.get("root");
            let cross = new Group();
            let l1 = new Guide.Line();
            l1.init(view);
            l1.setRadius(10);
            let l2 = new Guide.Line();
            l2.init(view);
            l2.setRadius(10);
            l2.setAngle(90);

            cross.addChild(l1);
            cross.addChild(l2);
            cross.style.set({
                strokeColor: "#CBCBCB",
                strokeScaling: false,
            })
            root.addChild(cross);
        }
        show() {
            // 
        }
        hidden() {}
    }
    Tool.Flag = Flag;

    class Grid extends Tool {
        constructor() {
            super("Grid");
        }
        initGuides() {
            let ins = this.getIns(),
                view = ins.ui.get("view");
            let root = this.keyg.get("root");
            let cross = new Group();
            for (let i = 0; i < 20; i++) {
                let vl = new Line(new Vec(i * 10, 0), new Vec(i * 10, 200)),
                    hl = new Line(new Vec(0, i * 10), new Vec(200, i * 10));
                cross.addChild(vl);
                cross.addChild(hl);
            }
            cross.style.set({
                strokeColor: "#CBCBCB",
                strokeScaling: false,
            })
            root.addChild(cross);
        }
    }
    Tool.Grid = Grid;
}