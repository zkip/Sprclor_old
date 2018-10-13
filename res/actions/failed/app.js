let lastToolTx = "";
let curToolTx = "";
let tools = {};

function start() {
    initUI();
    example();

    let tree = new Tree(document.querySelector(".Tree"));
    let inspector = new Inspector(document.querySelector(".Inspector"));
    let workspace = new Workspace(document.querySelector(".Workspace"));
    let ins = new Instance({
        tree: tree,
        inspector: inspector,
        workspace: workspace,
        paper: paper,
    }).init();
    tools = {
        picker: new Tool.Picker(ins),
        line: new Tool.Line(ins),
        rect: new Tool.Rect(ins),
        mutiShape: new Tool.MutiShape(ins),
        pen: new Tool.Pen(ins),
        pencil: new Tool.Pencil(ins),
        text: new Tool.Text(ins),
        mirror: new Tool.Mirror(ins),
        rotate: new Tool.Rotate(ins),
    };
    let line = new paper.Path.Line([-10, 0], [10, 0]);
    let cross = new paper.Group({
        children: [line, line.clone().rotate(90)],
        strokeColor: "red",
    });
    workspace.oprLayer.addChild(cross);

    let c = 0;
    for (let i = 0; i < 40; i++) {
        if (Math.random() > 0.4) {
            // tree.add(new Text("Hello"));
            // tree.add(new Modifier());
        } else {
            let rdmColor = `rgba(${[255*Math.random()>>0,255*Math.random()>>0,255*Math.random()>>0,1].join(",")})`;
            let p = new Path();
            p.strokeColor = "red";
            p.fillColor = rdmColor;
            p.moveTo(Math.random() * innerWidth, Math.random() * innerHeight);
            p.cubicCurveTo(
                [Math.random() * innerWidth, Math.random() * innerHeight],
                [Math.random() * innerWidth, Math.random() * innerHeight],
                [Math.random() * innerWidth, Math.random() * innerHeight]
            );
            p.lineTo(Math.random() * innerWidth, Math.random() * innerHeight);
            p.closePath();
            let ti = new TreeItem(p, c++);
            tree.items.insert(0, ti);
        }
    }


}

function initUI() {
    let toolbar = document.querySelector(".Toolbar");
    let toolGs = toolbar.querySelectorAll(".Toolbar>div");
    let toolIcons = toolbar.querySelectorAll("div>div>div");
    let dc = new Map();
    let c = 0;
    let lastToolD = null;
    toolIcons.forEach(d => {
        dc.set(d, c++);
        d.addEventListener("mousedown", e => {
            if (lastToolD) {
                lastToolD.classList.remove("active");
                lastToolD.parentNode.classList.remove("active");
            }
            d.classList.add("active");
            d.parentNode.classList.add("active");
            changeTool(d.getAttribute("name"));
            lastToolD = d;
        })
    })
}

function changeTool(toolTx) {
    if (toolTx === curToolTx) return;
    curToolTx = toolTx;
    if (lastToolTx) tools[lastToolTx].offMe();
    tools[curToolTx].onMe();
    lastToolTx = curToolTx;
}

function example() {

    let {
        view,
        Path,
        Point,
        Matrix,
        projects,
        project
    } = paper;
    let {
        random,
        abs,
        tan,
        sin
    } = Math;
    let curTools = null;

    let pools = [];
    // for (let i = 0; i < 300; i++) {
    //     let c;
    //     if (random() > 0.5) {
    //         c = new Path.Circle([random() * innerWidth, random() * innerHeight], random() * 120 + 20);
    //     } else {
    //         c = new Path.Rectangle([random() * innerWidth, random() * innerHeight], [random() * 180 + 20, random() * 120 + 20]);
    //     }
    //     pools.push({
    //         g: c,
    //         vec: new Point(random() * 10 - 5, random() * 10 - 5),
    //     });
    //     // c.strokeWidth = 10;
    //     c.strokeColor = 'rgba(' + [random() * 255 >> 0, random() * 255 >> 0, random() * 255 >> 0, random()].join(",") + ')';
    //     c.fillColor = c.strokeColor;
    // }
}
addEventListener("load", start);
oncontextmenu = () => false;