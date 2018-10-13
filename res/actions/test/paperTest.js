function start(paper) {
    let { view, Path, Point, Matrix, projects, project } = paper;
    let { random, abs, tan,sin } = Math;
    let pools=[];
    for (let i = 0; i < 300; i++) {
        let c;
        if (random() > 0.5) {
            c = new Path.Circle([random() * innerWidth, random() * innerHeight], random() * 120 + 20);
        } else {
            c = new Path.Rectangle([random() * innerWidth, random() * innerHeight], [random() * 180 + 20, random() * 120 + 20]);
        }
        pools.push({
            g: c,
            vec: new Point(random()*10-5,random()*10-5),
        });
        // c.strokeWidth = 10;
        c.strokeColor = 'rgba(' + [random() * 255 >> 0, random() * 255 >> 0, random() * 255 >> 0, random()].join(",") + ')';
        c.fillColor = c.strokeColor;
    }

    view.onFrame=(e)=>{
        pools.forEach((p,i) => {
            p.g.position.x+=sin(e.time/(random()*i))*p.vec.x;
            p.g.position.y+=sin(e.time/(random()*i))*p.vec.y;
        });
    }

    let scs = [0.2, 0.4, 0.8, 0.9, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1];

    addEventListener("wheel", (e) => {
        let { deltaY, clientX, clientY } = e;
        let p = view.viewToProject(clientX, clientY);
        let v = deltaY / 100;
        v=v>5?5:v;
        v=v<-5?-5:v;
        
        view.scale(1 - v * scs[abs(v)-1] * 0.15, p);
    })

    let isT = false;
    addEventListener("keydown", (e) => {
        if (e.code === "Space") {
            isT = true;
        }
    })
    addEventListener("keyup", (e) => {
        if (e.code === "Space") {
            isT = false;
        }
    })

    addEventListener("mousedown", (e) => {
        if (isT) {
            let ix = view.matrix.tx, iy = view.matrix.ty;
            let { clientX: sx, clientY: sy } = e;
            let fn1 = (e) => {
                let { clientX, clientY } = e;
                view.matrix.tx = ix + (clientX - sx);
                view.matrix.ty = iy + (clientY - sy);
            };
            let fn2 = (e) => {
                removeEventListener("mousemove", fn1);
                removeEventListener("mouseup", fn2);
            };
            addEventListener("mousemove", fn1);
            addEventListener("mouseup", fn2);
        }
    })

    // addEventListener("mousedown", (e) => {
    //     view.scaling = 1;
    // })

    let activeItem = null;
    addEventListener("mousemove", (e) => {
        let { clientX, clientY } = e;
        let p = view.viewToProject(clientX, clientY);

        let hitResult = project.hitTest(p, {
            tolerance: 2 / view.scaling.x,
            stroke: true,
            segments: true,
            fill: true,
        });
        if (hitResult) {
            if (hitResult.item !== activeItem) {
                if (activeItem) {
                    activeItem.style.strokeWidth = 1;
                    activeItem.selected = false;
                }
                activeItem = hitResult.item;
                hitResult.item.style.strokeWidth = 5;
                activeItem.selected = true;
            }
        }


    })

}

addEventListener("load", (e) => {
    let stage = document.querySelector("#stage");
    paper.setup(stage);
    let { view } = paper;
    // view.patch();
    start(paper);
    let init = () => {
        stage.width = innerWidth;
        stage.height = innerHeight;
        view.viewSize.set(innerWidth, innerHeight);
    }
    init();
    addEventListener("resize", init);
});