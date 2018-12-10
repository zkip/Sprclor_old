let lastToolTx = "";
let curToolTx = "";
let tools = {};
let lopt = UI.View.lopt;

function start() {
    let ins = new Instance();
    ins.ui.add("view", new UI.View(document.querySelector(".View")));
    ins.ui.add("toolbar", new UI.Toolbar(document.querySelector(".Toolbar")));
    ins.ui.add("tree", new UI.Tree(document.querySelector(".Tree")));
    ins.ui.add("inspector", new UI.Inspector(document.querySelector(".Inspector")));
    // ins.tools.add("Picker", new Tool.Picker());
    // ins.guides.add("rule", new Tool.Flag());
    // ins.tools.add("Line", new Tool.Line());
    // ins.tools.add("Rect", new Tool.Rect());
    // ins.tools.add("MultiShape", new Tool.MultiShape());
    // ins.tools.add("Pen", new Tool.Pen());
    // ins.tools.add("Pencil", new Tool.Pencil());
    // ins.tools.add("Text", new Tool.Text());
    // ins.tools.add("Mirror", new Tool.Mirror());
    // ins.tools.add("Rotation", new Tool.Rotation());
    ins.init();

    // pathTest(ins);
    // rectTest(ins);
    // circleTest(ins);
    // lineTest(ins);
    groupTest(ins);

    // guideTest(ins);

    // itemTest(ins);

    // proxyTest(ins);

    // vecGraphTest(ins);

}


function vecGraphTest(ins) {
    let view = ins.ui.get("view");
    view._view.translate(view._view.center);

    function pathTest() {
        let path = new Path();
        path.style.set({
            strokeColor: "red",
        })
        path.shape.byCount(5);
        path.shape.byCount(2);
        path.mp.setPosition(300, 100);
        let frag = path.shape.getByIdx(0);
        frag.byCount(1372);
        for (let i = 0; i < 1372; i++) {
            frag.makeSharp(i, new Vec(Math.random() * 120 - 60, Math.random() * 100 - 50));
        }
        let frag2 = path.shape.getByIdx(1);
        frag2.byCount(21);
        for (let i = 0; i < 72; i++) {
            frag2.makeSharp(i, new Vec(Math.random() * 120 - 260, Math.random() * 100 - 50));
        }
        path.fullySelected = true;
    }

    function TestToggle(...list) {
        let cur = 0;
        let allFn = p => {}
        list.forEach((fn, i) => {
            if (fn.name === "all") {
                allFn = fn;
                list.splice(i, 1);
            }
        })
        let frg = new Shape.Fragment();
        frg.byCount(list.length);
        domEv.append({
            keydown: e => {
                if (e.key === "v")
                    cur = frg.nextIdx(cur);
                if (e.key === "b")
                    cur = frg.prevIdx(cur);
            },
            mousemove: e => {
                let p = view.globalToLocal(e.toClientVec());
                list[cur](p);
                allFn(p);
            },
        });
    }

    function rectTest() {
        let rc = new Rect(new Vec(100, 100));
        rc.mp.setPosition(100, 0);
        rc.style.set({
            strokeColor: "red",
        })
        rc.mp.setRotation(30);
        rc.mp.setScaling(2, 1);
        let flag = new Rect(new Vec(5, 5));
        flag.style.set({
            strokeColor: "#3435f3",
        })

        function update() {
            flag.mp.setPosition(rc.mp.position);
        }
        update();

        TestToggle(
            (p) => {
                rc.shape.setRadius(p);
            },
            (p) => {
                rc.setCenter(p);
            },
            (p) => {
                rc.mp.setRotation(p.x);
                // rc.mp.setPosition(p);
            },
            (p) => {
                rc.shape.fromTo(new Vec, rc.mp.toLocal(p));
            },
            function all(p) {
                update();
            },
        )
    }

    function circleTest() {
        let c = new Circle(40);
        c.style.set({
            strokeColor: "red",
            strokeWidth: 1,
        })
        c.shape.setRatio(0.5);
        c.shape.setStart(40);
        c.shape.setSweep(359);
        // c.mp.skew(20, 10);
        let times = 0;
        let start = () => {
            // c.shape.setRatio(Math.cos(times / 150));
            c.shape.setStart(Math.sin(times / 200) * 360);
            // c.shape.setSweep(Math.cos(times / 100) * 360);
            // c.shape.setRadius(Math.sin(times / 30) * 40 + 120);
            times++;
            requestAnimationFrame(start);
        }
        start();
        domEv.append({
            mousemove: e => {
                let v = e.clientX / innerWidth;
                // c.shape.setSegmention(v * 10 >> 0);
                // c.fullySelected = true;
            }
        })
        // c.mp.scale(2,1);
        // c.mp.setPosition(-200,0);
    }

    function lineTest() {
        let l = new Line(new Vec(20, 20), new Vec(40, 90));
        l.style.set({
            strokeColor: "red",
        })
        let c = new Circle(5);
        c.style.set({
            strokeColor: "red",
        })
        let times = 0;
        let start = () => {
            l.shape.setAngle(times);
            // l.mp.setRotation(times);
            times++;
            requestAnimationFrame(start);
        }
        // start();

        test.mousemove(l.shape, {
            setAngleByEnd: (p) => p.x,
            setAngle: (p) => p.x,
            setRadius: (p) => p.x,
            setCA: (p) => p,
            setCB: (p) => p,
            setCenter: (p) => p,
        });

        l.shape.setCenter(new Vec(20, 100));
        let funcc = 0;
        domEv.append({
            mousedown: e => {
                funcc++;
                funcc > 4 && (funcc = 0);
            },
            mousemove: e => {
                let p = view.globalToLocal(e.toClientVec());
                if (funcc === 0) {
                    l.shape.setAngleByEnd(p.x);
                } else if (funcc === 1) {
                    l.shape.setAngle(p.x);
                } else if (funcc === 2) {
                    l.shape.setRadius(p.x);
                } else if (funcc === 3) {
                    l.shape.setCA(p);
                } else if (funcc === 4) {
                    l.shape.setCB(p);
                }
                c.mp.setPosition(l.shape.center);
            },
        })
    }

    rectTest();
    // circleTest();
    // lineTest();
}

function proxyTest(ins) {
    let view = ins.ui.get("view");
    let picker = ins.tools.get("Picker");
    view._view.translate(view._view.center);
    let operator1 = new Tool.Operator();
    operator1.setIns(ins)._init();
    let inspector = ins.ui.get("inspector");
    let sTX = new UI.Slider("translationX");
    let sTY = new UI.Slider("translationY");
    let pX = new UI.Slider("positionX");
    let pY = new UI.Slider("positionY");
    let sSX = new UI.Slider("scalingX");
    let sSY = new UI.Slider("scalingY");
    let sR = new UI.Slider("rotation");
    // sR.setValue(0.1);
    sSX.setRange(-2, 2);
    sSX.setValue(1);
    sSY.setRange(-2, 2);
    sSY.setValue(1);
    inspector.add(sTX);
    inspector.add(sTY);
    inspector.add(pX);
    inspector.add(pY);
    inspector.add(sSX);
    inspector.add(sSY);
    inspector.add(sR);
    let cross = new Tool.Flag().setIns(ins)._init();
    let grid = new Tool.Grid().setIns(ins)._init();
    let gg = grid.guides.get("root").firstKey();
    let cg = cross.guides.get("root").firstKey();
    cg.style.set({
        strokeColor: "blue",
    })
    let rc = new Rect(new Vec(-20, -20), new Vec(20, 20));
    let rc2 = new Rect(new Vec(-40, -40), new Vec(40, 40));

    let g = new Group();
    g.addChild(rc);
    g.addChild(rc2);
    g.style.set({
        strokeColor: "red",
    })
    let wg = new Group();
    wg.addChild(grid);
    wg.addChild(g);
    // wg.mp.skew(20,20);

    g.mp.rotate(45);
    let aB = 30;
    // wg.mp.rotate(30);
    wg.applyByTranslate(-100, 0);
    wg.applyByTranslate(-100, 0);
    wg.applyByTranslate(-100, 0);
    wg.applyByTranslate(-100, 0);
    wg.applyByTranslate(-100, 0);
    // rc.mp.rotate(30);
    // rc.applyByTranslate(-100, 0);

    // rc.applyByTranslate(-100, 0);
    // rc.applyByTranslate(-100, 0);
    // rc.applyByTranslate(-100, 0);
    // wg.mp.setRotation(45);
    // wg.mp._updateLocal();
    // wg.mp.setRotation(aB);
    // wg.mp.setCenter([0,50]);
    // wg.mp.setCenter([0,50]);
    // wg.mp.setCenter([0,50]);
    // wg.mp.setCenter([0,50]);
    // wg.mp.setRotation(45);
    // wg.mp.setCenter([0,50]);
    // wg.mp.setCenter([0,50]);
    // wg.mp.setCenter([0,50]);
    // wg.mp.setCenter([0,50]);
    // wg.mp.setCenter([0,50]);
    // wg.mp.setCenter([0,50]);
    // wg.mp.setCenter([0,150]);
    // wg.mp.setRotation(45);
    // wg.mp.setRotation(45);
    // wg.mp.setCenter([0,150]);
    // wg.mp.setCenter([0,150]);
    // wg.mp.setCenter([0,150]);
    // wg.mp.setCenter([0,150]);
    // wg.mp.setCenter([0,50]);
    // wg.mp.setCenter([0,50]);
    // wg.mp.setCenter([0,50]);
    // wg.mp.setCenter([0,50]);
    // wg.mp.setCenter([0,50]);
    // wg.mp.setCenter([0,50]);
    // wg.mp.setCenter([0,50]);
    // wg.mp.setRotation(90);
    // wg.mp.setRotation(360);
    // wg.mp.setCenter([0,0]);
    // wg.mp.setCenter([100,0]);
    // wg.mp.setCenter([100,0]);
    // setInterval(()=>{
    //     wg.mp.setRotation(aB++);
    //     _update();
    // },20);

    let cx = 0,
        cy = 0,
        angle = 0,
        sx = 1,
        sy = 1;

    // let cwg = wg.mp.clone();
    let ggg = g;

    addEventListener("keydown", e => {
        if (e.key === "1") {
            ggg = g;
        } else if (e.key === "2") {
            ggg = wg;
        }
    })

    function translateU() {
        ggg.mp.setTranslation(sTX.getValue() * 200, sTY.getValue() * 200);
        // ggg.mp.setTranslation(cwg.toLocal(new Vec(sTX.getValue() * 200, sTY.getValue() * 200)));
        _update();
    }

    function centerU() {
        ggg.mp.setPosition([pX.getValue() * 200, pY.getValue() * 200]);
        _update();
    }

    function rotationU() {
        ggg.mp.setRotation(sR.getValue() * 180);
        _update();
    }

    function scalingU() {
        ggg.mp.setScaling([sSX.getValue(), sSY.getValue()]);
        _update();
    }
    picker.operator.mEvent.add("scaleByCorner", () => {
        let decompose = wg.mp.decompose();
        // sTX.setValue(decompose.translation.x/200);
        // sTY.setValue(decompose.translation.y/200);
        // cTX.setValue(decompose.);
        // sR.setValue(decompose.rotation/180);
        // let scl=wg.mp.getScaling();
        // sSX.setValue(scl.x);
        // sSY.setValue(scl.y);
    })
    sTX.ev.add("change", translateU);
    sTY.ev.add("change", translateU);
    pX.ev.add("change", centerU);
    pY.ev.add("change", centerU);
    sR.ev.add("change", rotationU);
    sSX.ev.add("change", scalingU);
    sSY.ev.add("change", scalingU);
    translateU();
    centerU();
    rotationU();
    scalingU();

    // g.mp.setCenter(new Vec(200, 100));
    // g.mp.setCenter(new Vec(200, 100));
    // g.mp.setCenter(new Vec(200, 100));
    // g.mp.setPosition(200, 100);
    // wg.mp.setTranslation(wg.mp.toLocal([0,-100]));
    // wg.mp.setPosition(new Vec(0,100));
    // console.log(wg.mp.toLocal([0,100]));
    // wg.mp.setTranslation(wg.mp.toLocal([0,100]));
    // wg.mp.setTranslation(wg.mp.toLocal([0,100]));

    function _update() {
        // g.mp.setPosition(g.getGlobalBounds().center);
        let p = wg.mp.getPosition();
        cg.mp.setPosition(p);
        // console.log(ggg.mp.getPosition());
        // operator1.items.clear();
        // operator1.items.append(ggg);
    }
    _update();
}

function itemTest(ins) {
    let view = ins.ui.get("view"),
        picker = ins.tools.get("Picker");
    let p = new Path(new Fragment({
        segments: [
            [0, 0],
            [10, 20],
            [20, 100],
        ],
    }));
    p.addChild(new Fragment({
        segments: [
            [0, 0],
            [120, 220],
            [400, 400],
        ],
        // closed: true,
    }));
    p.style.set({
        fillColor: "#f390ea",
        strokeColor: "red",
    })
    let rc = new Rect(new Vec(-10, -10), new Vec(10, 10));
    rc.style.set({
        fillColor: "#f390ea",
        strokeColor: "blue",
    })
    rc.rotation = 35;
    let c = new Circle(new Vec(300, 120), 20);
    c.style.set({
        // fillColor: "#f390ea",
        strokeColor: "blue",
    })
    let g = new Group();

    g.addChild(p);
    // g.addChild(rc);

    let g2 = new Group();
    view.addChildren(g2);
    let p2 = new Path(new Fragment({
        segments: [
            [-20, 100],
            [0, 0],
            [20, 100],
        ],
    }));
    p2.position.set(200, 100);
    p2.style.set({
        strokeColor: "#567890",
    })
    g2.addChild(p2);
    g2.addChild(g);
    // g2.rotation = 45;
    // g2.mp.scale(2);
    // g2.
    // p.smooth();

    let c2 = new Circle(new Vec(300, 400), 50);
    c2.style.set({
        strokeColor: "red",
    })

    // g.position.set(100,120);
    // g.rotation = 45;
    // g.mp.scale(2, 1);
    // g.mp.rotate(45);
    // g._updateSegments();

    let operator = new Tool.Operator();
    operator.setIns(ins);
    operator._init();
    let _ = (k, v) => {
        v.style.set({
            strokeColor: "#E8A728",
        });
    }
    operator.guides.get("rotate", _);
    operator.guides.get("bounds", _);
    operator.guides.get("cornerScale", _);


    // g.position.set(new Vec);

    function st1(child) {
        let vs = child.bfVertex.get(child.children[0]);
        addEventListener("mousemove", e => {
            let p = view.globalToLocal(e.toClientVec());
            // p = g2.globalToLocal(p);
            // g2.position.set(p);
            // vs[0] = p.x;
            // vs[1] = p.y;
            // child._updateSegments();
        })
    }
    st1(p);

    let times = 0;
    let m = g2.matrix.clone();
    let center = g2.getGlobalBounds().center;
    center = g2.globalToLocal(center);
    console.log(center);
    setInterval(() => {
        g2.mp.rotate(1);
        g2._updateSegments();
        // m.rotate(1,center);
        // g2.matrix=m;
        // g.mp.rotate(2,new Vec(300,400));
        // g._updateSegments();
        // rc.rotation=times;
        // g._updateSegments();
        // g.rotation = times+=1;
        picker.selection.clear();
        picker.selection.append(g2);
        operator.items.clear();
        operator.items.append(g);
    }, 20)
}

function guideTest(ins) {
    let view = ins.ui.get("view");
    let rc = new Guide.Rect();
    rc._init(view);
    rc.setRadius(new Vec(2.5, 2.5));
    rc.setCenter(new Vec(200, 100));
    rc.rotation = 45;

    let c2 = new Guide.Circle();
    c2._init(view);
    c2.setCenter(new Vec(100, 200));
    c2.setRadius(10);

    let g = new Group();
    g.addChild(rc);
    g.addChild(c2);
}

function groupTest(ins) {
    let view = ins.ui.get("view");
    view.lookAtOrigin();
    let g = new Group();
    let g2 = new Group();
    let g3 = new Group();
    let rc = new Rect(new Vec(120, 80));
    rc.style.set({
        strokeColor: "red",
    })

    g.mp.scale(1.2, 1);
    g2.mp.rotate(30);
    g3.mp.skew(20, 10);

    g3.addChild(rc);
    g2.addChild(g3);
    g.addChild(g2);

    domEv.append({
        mousemove: e=>{
            let p=view.globalToLocal(e.toClientVec());
            rc.mp.setPosition(g3.mp.toLocal(p));
        }
    })
}

function pathTest(ins) {
    let view = ins.ui.get("view");
    let fragA = new Fragment({
        segments: [
            new Vec(-20, -10),
            new Vec(20, -10),
            new Vec(20, -20),
            new Vec(30, 0),
            new Vec(20, 20),
            new Vec(20, 10),
            new Vec(-20, 10),
        ],
        closed: true,
        // strokeColor: "red",
    });
    let p = new Path(fragA);
    p.style.set({
        strokeColor: "#701e3f",
        strokeWidth: 3,
    });
    p.fullySelected = true;
    p.smooth({
        type: "geometric",
    });

    let c = p.bounds.center;
    p.position.set(view._view.center);
    p.rotation = 30;
    let t = 0;
    setInterval(() => {
        t++;
        // p.vt=new Matrix();
        // p.vt.scale(Math.sin(t/40)*2, 1);
        // p.vt.rotate(1);
        // p.updateByMt();
        // p._updateSegments();
    }, 20)
    p._updateSegments();

    // let offseter = p.mt.seperate();
    addEventListener("mousemove", e => {
        let cv = view.globalToLocal(e.toClientVec());
        p.position.set(cv);
        // p.rotation = 30;
        let m = new Matrix();
        m.scale([1, Math.sin(cv.x / 100) * 2], c);
        p.mp = m;
        p._updateSegments();
    })

    addEventListener("keydown", e => {
        if (e.key === "1") {
            p.applyMt();
        } else if (e.key === "2") {
            p.applyTransform();
        }
    })

    function updateBounds() {
        let bounds = p.getResetBounds();
        bn.fromTo(bounds.topLeft, bounds.bottomRight);
    }
}

function circleTest(ins) {
    let view = ins.ui.get("view");
    let c = new Circle(new Vec(300, 400), 100);
    // c.fullySelected = true;
    c.strokeColor = "red";
    c.applyMatrix = false;
    // c.fillColor = "blue";
    let start = 0;
    let sweep = 360;
    setInterval(() => {
        start++;
        let r = Math.cos(start / 27);
        c.setRatio(Math.abs(r));
        c.setStart(Math.sin(start / 10) * 120);
        c.setSweep(Math.cos(start / 50 + 20) * 360);
        // c.rotate(2, c.shape.center);
    }, 20);
    c.mp.scale([1, 2], c.bounds.center);
    addEventListener("mousedown", e => {

    })
    let center = c.center.clone();
    addEventListener("mousemove", e => {
        let p = view.globalToLocal(e.toClientVec());
        c.setCenter(c.globalToLocal(p)); // ok

        // c.setRadius(p.subtract(center).length); // ok

        // c.setRatio(p.subtract(center).length / c.getRadius()); // ok
    })
}

function lineTest(ins) {
    let view = ins.ui.get("view");
    let l = new Line(new Vec(100, 100), new Vec(200, 200));
    l.strokeColor = "red";
    addEventListener("mousemove", e => {
        let p = view.globalToLocal(e.toClientVec());
        l.setA(p);
        // l.setRaiuds(p.x);
        // l.setAngle(p.x);
        // l.setAngleByEnd(p.x);
        // l.setCenter(p);
        // circle.setCenter(l.center);
    })
}

function rectTest(ins) {
    let rc = new Rect(new Vec(120, 40), new Vec(250, 120));
    // rc.fullySelected=true;
    // rc.vt.scale(1,1.1);
    rc.strokeColor = "red";
    let center = new paper.Path.Circle({
        radius: 5,
        strokeColor: "red"
    });
    let size = new paper.Path.Line({
        strokeColor: "blue",
    });
    let radius = size.clone();
    radius.style.set({
        strokeColor: "pink",
        strokeWidth: 3,
    })
    radius.opacity = 0.8;
    let sides = [];
    for (let i = 0; i < 4; i++) {
        let r = new paper.Path.Rectangle({
            size: [8, 8],
            strokeColor: "green",
        });
        r.rotate(45);
        sides.push(r);
    }

    // rc.mp.rotate(30,rc.bounds.center);
    // rc.mp.scale([2, 1], rc.bounds.center);
    // rc.updateByMt();
    // rc.vt.rotate(1);
    let ip = rc.bounds.center.clone();
    addEventListener("mousemove", (e) => {
        let p = ins.ui.get("view").globalToLocal(e.toClientVec());
        rc.setCorner(0, rc.globalToLocal(p));
        // rc.setCorner(0, p);

        let a = new Vec(Math.random() * 200, Math.random() * 200);
        rc.fromTo(a, rc.globalToLocal(p));

        // rc.setCenter(p);

        // rc.setRadius(p.subtract(ip));

        // rc.setSide(0, p.y);
        // rc.setSide(3, p.x);

        let segs = rc.children[0].segments;

        // center
        center.position.set(rc.center);

        // size
        size.segments[0].point.set(segs[0].point);
        size.segments[1].point.set(segs[2].point);

        // radius
        // radius.segments[0].point.set(rc.center);
        // radius.segments[1].point.set(rc.center.add(rc.radius));

        // sides[0].position.set(rc.center.x, rc.sides[0]);
        // sides[2].position.set(rc.center.x, rc.sides[2]);
        // sides[1].position.set(rc.sides[1], rc.center.y);
        // sides[3].position.set(rc.sides[3], rc.center.y);
    })
}
addEventListener("load", start);
oncontextmenu = () => false;