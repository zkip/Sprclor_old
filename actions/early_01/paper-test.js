function start(paper) {
    let { view, Path, Point, Matrix, projects } = paper;
    let c = new Path.Rectangle(0, 0, 80, 120);
    c.strokeColor = '#f60';
    c.position = new Point(0, 0);

    let flag=new Path.Circle([0,0],10);
    flag.fillColor='#f4f81f';

    // c.applyMatrix = false;
    view.onFrame = (e) => {
        // c.scaling.x = 1.01;
        c.rotation = 10;
        // c.scale(1.01);
        // c.applyMatrix=true;
        // c.translate(Math.sin(e.time)*20,120);
    }
    
    addEventListener("mousedown", (e) => {
        c.applyMatrix = !c.applyMatrix;
    })

    addEventListener("mousemove", (e) => {
        let { layerX, layerY } = e;
        flag.position = [layerX, layerY];
        // console.log(c.getRotation());
    })

    addEventListener("wheel",(e)=>{
        let {deltaY}=e;
        if(deltaY>0){
            view.matrix.scale(1.1);
        }else{
            view.matrix.scale(0.9);
        }
    });

}

addEventListener("load", (e) => {
    let stage = document.querySelector("#stage");
    paper.setup(stage);
    let { view } = paper;
    view.patch();
    start(paper);
    let init = () => {
        stage.width = innerWidth;
        stage.height = innerHeight;
        view.viewSize.set(innerWidth, innerHeight);
    }
    init();
    addEventListener("resize", init);
});