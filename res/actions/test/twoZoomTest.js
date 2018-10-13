addEventListener("load", () => {
    let work = document.querySelector("#work");
    let inspector = document.querySelector(".inspector");
    let flag = document.createElement("span");

    let two = new Two({ width: '100%', height: '100%' }).appendTo(work);
    let line = two.makeLine(100, 100, 200, 170);

    line.stroke = '#f60';
    line.linewidth = 5;
    console.log(two.scene._matrix.elements);

    let zui = new ZUI(two);
    zui.addLimits(0.06, 8);
    let ratio = 1 / 10;
    addEventListener("wheel", (e) => {
        var e = event;
        e.stopPropagation();
        e.preventDefault();
        var dy = (e.wheelDeltaY || - e.deltaY);
        dy /= Math.abs(dy);
        dy *= ratio;
        // console.log(zui.scale,zui.zoom,zui.scale-zui.zoom);

        // console.log(zui);

        zui.zoomBy(dy, e.clientX, e.clientY);
        two.update();
    });


    work.addEventListener("mousedown", (e) => {
        let { layerX: ix, layerY: iy } = e;
        let [cx, cy] = zui.getTransition();
        let _m = (e) => {
            let { layerX, layerY } = e;
            zui.moveTo(layerX - ix + cx, layerY - iy + cy);
            two.update();
        }
        let _ = () => {
            removeEventListener("mousemove", _m);
            removeEventListener("mouseup", _);
        }
        addEventListener("mousemove", _m);
        addEventListener("mouseup", _);
    });

    two.update();
})