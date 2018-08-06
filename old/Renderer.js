class Renderer {
    constructor(dom){
        this.dom=null;
        this.setElement(dom);
    }
    // DOM:
    setElement(d){
        this.dom=d;
    }
    // @override
    point(){}
    // @override
    line(){}
    // @override
    face(){}
}