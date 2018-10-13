class Path extends this.Base {
    constructor() {}
}
class Tool extends this.Base {
    constructor() {}
}
class Renderer extends this.Base {
    constructor() {}
}
class Camera extends this.Base {
    constructor() {}
}
// 用户界面视图
class View extends this.Base {
    constructor(name) {
        super("View");
        assign({
            name: name,
            parent: null,
            children: new Map
        });
    }
    // 插入文档
    add() {}
    // 从文档移除
    rm() {}
}