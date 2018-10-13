class GObj {}

class Modifier extends GObj {}
class Text extends GObj {}

class Inspector {
    constructor(d) {
        this.dom = d;
    }
}
class Workspace {
    constructor(d) {
        this.dom = d;
        this.objectLayer = null;
        this.oprLayer = null;
    }
}
