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
    ins.tools.add("Picker", new Tool.Picker());
    ins.guides.add("rule", new Tool.Flag());
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
    // groupTest(ins);

    // guideTest(ins);

    // itemTest(ins);

    proxyTest(ins);

    // customExtendor(ins);
}

function proxyTest(ins) {
    let view = ins.ui.get("view");
    view._view.translate(view._view.center);
    let operator1=new Tool.Operator();
    operator1.setIns(ins)._init();
    let inspector = ins.ui.get("inspector");
    let sTX = new UI.Slider("translationX");
    let sTY = new UI.Slider("translationY");
    let cTX = new UI.Slider("centerX");
    let cTY = new UI.Slider("centerY");
    let sSX = new UI.Slider("scalingX");
    let sSY = new UI.Slider("scalingY");
    let sR = new UI.Slider("rotation");
    sSX.setRange(-2, 2);
    sSX.setValue(1);
    sSY.setRange(-2, 2);
    sSY.setValue(1);
    inspector.add(sTX);
    inspector.add(sTY);
    inspector.add(cTX);
    inspector.add(cTY);
    inspector.add(sSX);
    inspector.add(sSY);
    inspector.add(sR);
    let cross = new Tool.Flag();
    cross.setIns(ins);
    cross._init();
    let grid = new Tool.Grid();
    grid.setIns(ins);
    grid._init();
    let cg = cross.guides.get("root").firstKey();
    cg.style.set({
        strokeColor: "blue",
    })
    let rc = new Rect(new Vec(-20, -20), new Vec(20, 20));
    let rc2 = new Rect(new Vec(-40, -40), new Vec(40, 40));
    rc.mp.translate(0, 50);
    rc.mp.rotate(45);
    rc2.mp.setRotation(45);
    // rc.mp.setPosition();
    let wg = new Group();
    let g = new Group();
    g.addChild(rc);
    g.addChild(rc2);
    wg.addChild(g);
    wg.addChild(grid);
    wg.mp.scale(2,1);
    wg.mp.rotate(45);
    wg.mp.skew(200,100);
    g.style.set({
        strokeColor: "red",
    })
    // g.mp.setPosition(100, 200);
    // cg.mp.setPosition(g.mp.center);
    // g.mp.rotate(45);
    // rc.mp.setRotation(45);
    // path.mp.scale(0);
    // path.mp.setScaling(new Vec(1,0.2));
    // console.log(path.mp.get());

    let cx = 0,
        cy = 0,
        angle = 0,
        sx = 1,
        sy = 1;

    function translateU() {
        g.mp.setPosition([sTX.getValue() * 200, sTY.getValue() * 200]);
        _update();
    }

    function centerU() {
        g.mp.setCenter([cTX.getValue() * 200, cTY.getValue() * 200]);
        _update();
    }

    function rotationU() {
        g.mp.setRotation(sR.getValue() * 180);
        _update();
    }

    function scalingU() {
        g.mp.setScaling([sSX.getValue(), sSY.getValue()]);
        _update();
    }
    sTX.ev.add("change", translateU);
    sTY.ev.add("change", translateU);
    cTX.ev.add("change", centerU);
    cTY.ev.add("change", centerU);
    sR.ev.add("change", rotationU);
    sSX.ev.add("change", scalingU);
    sSY.ev.add("change", scalingU);
    translateU();
    centerU();
    rotationU();
    scalingU();
    // g.mp.setCenter(200, 100);
    // g.mp.setPosition(200, 100);

    function _update() {
        cg.mp.setCenter(wg.globalToLocal(g.mp.center));
        operator1.items.clear();
        operator1.items.append(rc);
    }

    let c = 0;
    domEv.append({
        mousemove: e => {
            let p = view.globalToLocal(e.toClientVec());
            // g.mp.setPosition(g.globalToLocal(p));
            // g.mp.setPosition((p));
            // cg.mp.setPosition(g.mp.center);
            // rc.setCenter(g.globalToLocal(p));
        },
        mousedown: e => {
            // g.mp.setRotation(c += 15);
            // cg.mp.setPosition(g.mp.center);
            // console.log(g.mp.center);
        },
    })
    setInterval(() => {
        // rc.mp.setScaling([1, Math.sin(c / 10)]);
        // g.mp.setRotation(Math.sin(c / 10) * Math.cos(c / 100) * 50);
        // rc.mp.setPosition([Math.sin(c / 20) * 100, 0]);

        c++;
    }, 20);
}

function customExtendor(ins) {
    let mp = new MPath(1, 2, 3, 4);
    mp.translate(100, 0);
    let f = new Fragment({
        segments: [
            [100, 200],
            [200, 300],
            [120, 60]
        ],
    });
    let f2 = new Fragment({
        segments: [
            [300, 200],
            [50, 300],
            [470, 260]
        ],
    });
    mp.addChild(f);
    mp.addChild(f2);
    mp.style.set({
        fillColor: "blue",
        strokeColor: "red",
        fillRule: "evenodd",
    })
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
    // g2.coordMatrix.scale(2);
    // g2.
    // p.smooth();

    let c2 = new Circle(new Vec(300, 400), 50);
    c2.style.set({
        strokeColor: "red",
    })

    // g.position.set(100,120);
    // g.rotation = 45;
    // g.coordMatrix.scale(2, 1);
    // g.coordMatrix.rotate(45);
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
        g2.coordMatrix.rotate(1);
        g2._updateSegments();
        // m.rotate(1,center);
        // g2.matrix=m;
        // g.coordMatrix.rotate(2,new Vec(300,400));
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
    let g = new Group();
    let rc = new Rect(new Vec(100, 100), new Vec(200, 200));
    rc.style.set({
        fillColor: "blue",
        strokeColor: "red",
    })
    let rc2 = new Rect(new Vec(250, 100), new Vec(350, 200));
    rc2.style.set({
        fillColor: "#33fd07",
        strokeColor: "red",
    })
    // rc2.rotation=150;
    rc2.coordMatrix.scale(1.2, 1);
    let c1 = new Circle(new Vec(150, 150), 20);
    c1.style.set({
        strokeColor: "red",
    })
    c1.setSweep(270);
    c1.setRatio(0.5);
    g.addChild(rc);
    g.addChild(rc2);
    g.addChild(c1);
    // g.coordMatrix.scale([1, 1], g.bounds.center);
    g.coordMatrix.skew([10, 20], g.bounds.center);
    g._updateSegments();
    let center = c1.center.clone();
    let gc = g.bounds.center.clone();
    let c = 0;
    setInterval(() => {
        let m = new Matrix();
        m.rotate(1, gc);
        g.coordMatrix.append(m);
        rc.coordMatrix.rotate(2, center);
        c1.setStart(-c * Math.sin(c / 10));
        g._updateSegments();

        c++;
    }, 20)
    // console.log(rc.coordMatrix, rc._getFinallyCoordMatrix());
    // console.log(object);
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
        p.coordMatrix = m;
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
    c.coordMatrix.scale([1, 2], c.bounds.center);
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

    // rc.coordMatrix.rotate(30,rc.bounds.center);
    // rc.coordMatrix.scale([2, 1], rc.bounds.center);
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