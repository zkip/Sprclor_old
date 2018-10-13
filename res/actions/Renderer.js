class Renderer {
    constructor() {
        assign(this,new Observable());
        assign(this, {
            data: [],
            sty: [],
            camera: null,
        });
    }
    setCamera(cam){
        this.camera=cam;
        cam.subscribe("update",(data)=>{    
            let {sty,data}=data;
            if(sty){
                this.sty=sty;
            }
            if(data){
                this.data=data;
            }
            this.render();
        });
    }                                   
    bindTarget(d) {
        this.target = d;
    }
    // :[Obvable,styer]
    serialize() {               // 将Modifier、Filter、Instance、Constraint的的值进行“栅格化”
        let sequence = [];
        this.data.forEach(item => {
            let typ = item.getType();
            if (typ === "Point" || typ === "Path") {
                sequence.push(item);
            } else if (typ === "Modifier") {

            } else if (typ === "Filter") {

            } else if (typ === "Instance") {

            } else if (typ === "Constraint") {

            }
        });

        return sequence;
    }
    // 绘制实现
    render() { }
}
assign(Renderer,Observable);

class CanvasRenderer extends Renderer {
    constructor() {
        super();
    }
    bindTarget(d) {
        this.target = d;
        this.ctx = this.target.getContext("2d");
    }
    setSize(size) {
        this.target.width = size.x;
        this.target.height = size.y;
    }
    // :[styer,Obvable]
    // serialize() {
    //     let list = [];
    //     let p = new Path();
    //     let { M, L, B, Z } = Path.CmdList;
    //     p.content = [
    //         [M, 120, 30],
    //         [B, 220, 130, 320, 100, 140, 70],
    //         [L, 220, 130],
    //         [L, 90, 530],
    //         [Z],
    //     ];
    //     list.push([p, {
    //         stroke: { lineWidth: 2, color: new Color(120, 230, 0, 1) }
    //     }]);
    //     return list;
    // }
    render() {
        let { ctx, sty } = this;
        ctx.clearRect(0, 0, this.target.width, this.target.height);
        this.serialize().forEach(item => {
            let typ = item.getType();
            ctx.save();
            let pos = item.position;
            let rot = item.rotation;
            let scl = item.scaling;
            ctx.rotate(rot);
            ctx.scale(scl.x, scl.y);
            ctx.translate(pos.x, pos.y);
            ctx.beginPath();
            if (typ === "Point") {
                ctx.arc(0, 0, 5, 0, Math.PI * 2);
            } else if (typ === "Path") {
                let { content } = item;
                content.forEach(ps => {
                    let m = CanvasRenderer.MethodCmdMap[ps[0]];
                    ps.shift();
                    ctx[m](...ps);
                });
            }
            let { stroke, fill } = sty;
            if (stroke) {
                let { lineWidth, color } = stroke;
                if (lineWidth && color && color.a !== 0) {
                    ctx.lineWidth = lineWidth;
                    ctx.strokeStyle = color.tx();
                    ctx.stroke();
                }
            }
            if (fill) {
                let { color } = fill;
                ctx.fillStyle = color.tx();
                ctx.fill();
            }
            ctx.restore();
        });
    }
}

CanvasRenderer.MethodCmdMap = {
    [Path.CmdList.M]: "moveTo",
    [Path.CmdList.L]: "lineTo",
    [Path.CmdList.B]: "bezierCurveTo",
    [Path.CmdList.S]: "",
    [Path.CmdList.Z]: "closePath",
}

class PaperJsRenderer extends Renderer {

}