class World {
    constructor() {
        this.stor = new MemStor({
            isConstrainted: {
                string: bool,
            },
            canMoved: {
                string: bool,
            },
            constraint: {
                string: bool,
            },
            Point: {

            },
        });
        this.sgnSrc = new Observer.create();
    }
    // 修改点
    // ID,number,number,...number:
    setPoint(id, x, y, ...z) {
        let { stor } = this;
        let fx = 0, fy = 0, fz = 0;
        // 如果有约束则使用约束提供的值
        if (stor.get("constrainted", id)) {
            let o = getConstraintPosition(id, x, y, z);
            fx = o.x;
            fy = o.y;
            fz = o.z;
        } else {
            fx = x;
            fy = y;
            fz = z;
        }
        // 发出修改信号
        this.stor.set({
            GType: "Point",
            ID: id,
        },
            ["x", "y", "z"],
            [fx, fy, fz]
        );
        this.sgnSrc.next("hasModified",id);
    }
    // 获取点
    // PointQueryOption:(PointCollectoin)
    getPoint(qOpt) {

    }
    // 获取线
    // LineQueryOption:(LineCollectoin)
    getLine(qOpt) {

    }
    // 获取面
    // FaceQueryOption:(FaceCollectoin)
    getFace(qOpt) {

    }
}

let PointQueryOption = {
    "pos": { x: 0, y: 0 },   // 查找位置
    "near": "10",       // 查找区域，以此值为半径查找
    "ID": "0",              // 通用查找方法
};

let LineQueryOption = {
    "pos": { x: 0, y: 0 },  // 查找位置经过的线
    "near": "10",
    "ID": "0",
    "Point.ID": "0",        // 查找指定点连接到的线
};

let FaceQueryOption = {
    "pos": { x: 0, y: 0 },
    "near": "10",
    "ID": "0",
    "Point.ID": "0",
    "Line.ID": "0",
}