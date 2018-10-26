let lastToolTx = "";
let curToolTx = "";
let tools = {};

function start() {
    let ins = new Instance();
    ins.ui.add("toolbar", new UI.Toolbar(document.querySelector(".Toolbar")));
    ins.ui.add("tree", new UI.Tree(document.querySelector(".Tree")));
    ins.ui.add("inspector", new UI.Inspector(document.querySelector(".Inspector")));
    ins.ui.add("view", new UI.View(document.querySelector(".View")));
    ins.tools.add("Picker", new Tool.Picker());
    ins.tools.add("Line", new Tool.Line());
    ins.tools.add("Rect", new Tool.Rect());
    ins.tools.add("MultiShape", new Tool.MultiShape());
    ins.tools.add("Pen", new Tool.Pen());
    ins.tools.add("Pencil", new Tool.Pencil());
    ins.tools.add("Text", new Tool.Text());
    ins.tools.add("Mirror", new Tool.Mirror());
    ins.tools.add("Rotation", new Tool.Rotation());
    ins.init();
    
    let c=new paper.Path.Circle({
        position: [100,100],
        radius: 50,
        strokeColor: "red",
    });
    let sty1=c.style.clone();
    console.log(sty1.strokeWidth);
    c.style.strokeWidth=10;
    c.dashArray=[10,4];
    c.style.set(new Style());

}

// function initUI() {
//     let toolbar = document.querySelector(".Toolbar");
//     let toolGs = toolbar.querySelectorAll(".Toolbar>div");
//     let toolIcons = toolbar.querySelectorAll("div>div>div");
//     let dc = new Map();
//     let c = 0;
//     let lastToolD = null;
//     toolIcons.forEach(d => {
//         dc.set(d, c++);
//         d.addEventListener("mousedown", e => {
//             if (lastToolD) {
//                 lastToolD.classList.remove("active");
//                 lastToolD.parentNode.classList.remove("active");
//             }
//             d.classList.add("active");
//             d.parentNode.classList.add("active");
//             changeTool(d.getAttribute("name"));
//             lastToolD = d;
//         })
//     })
// }

// function changeTool(toolTx) {
//     if (toolTx === curToolTx) return;
//     curToolTx = toolTx;
//     if (lastToolTx) tools[lastToolTx].mEvent.execute("off");
//     tools[curToolTx].mEvent.execute("on");
//     lastToolTx = curToolTx;
// }

addEventListener("load", start);
oncontextmenu = () => false;