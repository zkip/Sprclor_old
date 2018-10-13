oncontextmenu = function () {
    return false;
}
addEventListener("load", () => {

    // let root = new View.Root(document.querySelector("body"));
    // let toolbar = new View.Toolbar().addTo(root);
    // let workspace = new View.Workspace().addTo(root);
    // let inspector = new View.Inspector().addTo(root);

    // 存储Tool
    // Tool.name : Tool
    let tools = {};

    // Tool.name : { target : { eventType : fn } }

    // 存储Tools的事件回调
    // target : { eventType : { Tool.name : fn } }
    let evts = new Map();

    let epool = new Map();
    /*
        if !每一个target的每一种et只有一种 {
            调用接口addListener
            拓展epool
        } else {
            添加至epool中
        }
    */
    // str,View,str,fn:
    function handler(target, toolName, et, fn) {
        let _ = epool.get(toolName);
        if (!_) {
            _ = epool.set(toolName, new Map());
        }
        _ = _.get(target);
        if (!_) {
            epool.get(toolName).set(target, new Map());
            target.addListener(et, (e) => {
                epool.get(toolName).forEach(t => {
                    t.get(et)(e);
                });
            });
        }
        epool.get(toolName).get(target).set(et, fn);
    }

    function newTool(p) {
        tools[p.name] = p;
        let etOpt = p.event();
        for (let et in etOpt) {
            let {
                fn,
                target
            } = etOpt[et];
            handler(target === "global" ? root : root.get(target), p.name, et, fn);
        }
    }

    function rmTool(p) {
        delete tools[p.name];
        for (let et in evts_tn_ft) {
            delete evts[et][p.name];
        }
        delete evts_tn_ft[p.name];
    }

    // example
    // let p = new Tool.Picker();
    // newTool(p);

    // workspace.init((d) => {
    //     paper.setup(d);
    // });

    // let work = document.querySelector(".work");
    // let cvs = document.createElement("canvas");
    // work.appendChild(cvs);
    // paper.setup(cvs);
    // let {
    //     view,
    //     project
    // } = paper;
    // let {
    //     random,
    //     abs,
    //     tan,
    //     sin
    // } = Math;
    // let oftRect = cvs.getBoundingClientRect();
    // let ox = oftRect.left,
    //     oy = oftRect.top;
    // let scs = [0.2, 0.4, 0.8, 0.9, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1];

    // let resize = function () {
    //     let w = work.offsetWidth,
    //         h = work.offsetHeight;
    //     cvs.width = w;
    //     cvs.height = h;
    //     view.viewSize.set(w, h);
    // }
    // resize();
    // addEventListener("resize", resize);
    // addEventListener("wheel", (e) => {
    //     let {
    //         deltaY,
    //         clientX,
    //         clientY
    //     } = e;
    //     let p = view.viewToProject(clientX - ox, clientY - oy);
    //     let v = deltaY / 100;
    //     v = v > 5 ? 5 : v;
    //     v = v < -5 ? -5 : v;

    //     view.scale(1 - v * scs[abs(v) - 1] * 0.15, p);
    // })

    // let isT = false;
    // addEventListener("keydown", (e) => {
    //     if (e.code === "Space") {
    //         isT = true;
    //     }
    // })
    // addEventListener("keyup", (e) => {
    //     if (e.code === "Space") {
    //         isT = false;
    //     }
    // })

    // addEventListener("mousedown", (e) => {
    //     if (isT || e.button === 1) {
    //         let ix = view.matrix.tx,
    //             iy = view.matrix.ty;
    //         let {
    //             clientX: sx,
    //             clientY: sy
    //         } = e;
    //         let fn1 = (e) => {
    //             let {
    //                 clientX,
    //                 clientY
    //             } = e;
    //             view.matrix.tx = ix + (clientX - sx);
    //             view.matrix.ty = iy + (clientY - sy);
    //         };
    //         let fn2 = (e) => {
    //             removeEventListener("mousemove", fn1);
    //             removeEventListener("mouseup", fn2);
    //         };
    //         addEventListener("mousemove", fn1);
    //         addEventListener("mouseup", fn2);
    //     }
    // })

    function getView(name) {
        // return 
    }

    // start();

    let order = 0;

    function selectTool(order) {
        // 
    }

    let p = new Path();
    let pt1 = new Point(0, 10);
    let pt2 = new Point(40, 20);
    let seg = new Segment();
    p.addPoint(pt1);
    p.addPoint(pt2);
    p.link(pt1, pt2, seg);

    console.log(p.getPoints({
        position: new Point(40, 100),
        near: 100,
    }));

    console.log(p.getSegments());
    let data = new Date();
    let renderer = new Renderer(data);
    let framework = new Framework(document.querySelector("body"));
    framework.workspace.init(cvs => {
        paper.setup(cvs);
        // let p = new paper.Path({
        //     strokeColor: 'orange',
        // });
        // p.moveTo(120, 200);
        // p.quadraticCurveTo([20, 80], [500, 200]);
        renderer.render();
    });
    addEventListener("resize", renderer.render);

});