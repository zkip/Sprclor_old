addEventListener("load", (e) => {
    let stage = document.querySelector("#stage");
    paper.setup(stage);
    let { view, Path, Point, Matrix } = paper;
    // view.draw();
    view.patch();

    console.log(paper.project);
    // console.log(view);
    // view.center=[0,0];
    // view.zoom=2;

    // console.log(view.getBounds().getSize());

    // view.viewSize.width=120;


    let start = new Point(300, 180);
    let k = new Path.Circle(start, 100);
    console.log(k);

    k.strokeColor = '#f60';
    addEventListener("mousemove", (e) => {
        let { layerX, layerY } = e;
        // k.position.x=layerX;
        // k.position.y=layerY;
    })

    view.pZoomTo(2,[300,180]);

    console.log(view.getViewport());

    let z=1;
    addEventListener("wheel", (e) => {
        let { deltaY, layerX, layerY } = e;
        if (deltaY > 0) {
            z/=1.1;
        } else {
            z*=1.1;
        }
        view.pZoomTo(z, [layerX,layerY]);
        console.log(z);

        // view.pinTo(layerX * (1 - view.getZoom()), layerY * (1 - view.getZoom()));
    })

    let init = () => {
        stage.width = innerWidth;
        stage.height = innerHeight;
        view.viewSize.set(innerWidth, innerHeight);
    }
    init();
    addEventListener("resize", init);

    

})