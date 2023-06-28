import { assign } from "lodash";
import paper from 'paper';

export class Camera {

    private stage: HTMLElement;
    private canvas: HTMLCanvasElement;

    constructor(options: { stage: HTMLElement, canvas: HTMLCanvasElement }) {
        // assign(this, options)
        const { canvas, stage } = options;
        this.canvas = canvas;
        this.stage = stage;
    }

    init() {
        const project = paper.project;
        const view = project.view;

        let objl = project.activeLayer;
        let oprl = new paper.Layer();

        project.addLayer(oprl);

        oprl.data = "oprL";
        objl.data = "objL";

        let oftRect = this.stage.getBoundingClientRect();
        let ox = oftRect.left,
            oy = oftRect.top;
        let scs = [0.2, 0.4, 0.8, 0.9, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1];

        this.stage.addEventListener("wheel", (event) => {
            // 需要做兼容处理
            let { deltaY, clientX, clientY } = event;
            let p = view.viewToProject(new paper.Point(clientX - ox, clientY - oy));
            let ss = view.scaling.x;
            if (Math.abs(deltaY) < 100) {
                // 精确滚动，如笔记本的触摸板
            } else {
                let v = deltaY / 100 >> 0;
                v = v > 5 ? 5 : v;
                v = v < -5 ? -5 : v;
                ss = 1 - v * scs[Math.abs(v) - 1] * 0.15;
                view.scale(ss, p);
                // me.mEvent.execute("viewScaling", view.scaling.x);

                console.log("viewScaling...", view.scaling.x);
            }
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

        this.stage.addEventListener("mousedown", (event) => {
            if (isT || event.button === 1) {

                let ix = view.matrix.tx,
                    iy = view.matrix.ty;

                let { clientX: sx, clientY: sy } = event;

                let fn1 = (e: MouseEvent) => {
                    let { clientX, clientY } = e;
                    view.matrix.tx = ix + (clientX - sx);
                    view.matrix.ty = iy + (clientY - sy);
                };

                let fn2 = (e: MouseEvent) => {
                    removeEventListener("mousemove", fn1);
                    removeEventListener("mouseup", fn2);
                };

                addEventListener("mousemove", fn1);
                addEventListener("mouseup", fn2);
            }
        })

        return this;
    }
}