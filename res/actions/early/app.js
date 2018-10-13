function start() {
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

    // let pools = [];
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