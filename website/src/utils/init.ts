import { assign } from "lodash";
import paper from "paper";

const stageSize = { width: 0, height: 0 }
export function initRender(stage: HTMLElement, onResize?: () => void) {
    const canvas = stage.querySelector("canvas")!;
    paper.setup(canvas);

    const robs = new ResizeObserver((entries) => {
        for (const entry of entries) {
            if ('contentRect' in entry) {
                resize();
            }
        }
    });

    function resize() {
        const { clientWidth: width, clientHeight: height } = stage;
        canvas.width = width;
        canvas.height = height;
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
        assign(stageSize, { width, height })
        onResize?.();

        // @ts-ignore
        paper.project.view._needsUpdate = true;
        paper.project.view.update();
        paper.project.view.viewSize.set(width, height);
    }
    resize();

    robs.observe(stage);

    return () => {
        paper.project.clear();
        robs.disconnect();
    };
}

export function getStageSize() {
    return stageSize;
}