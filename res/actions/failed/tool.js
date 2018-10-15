class Tool {
    constructor(name, ins) {
        this.name = name;
        this.instance = ins;
    }
    onMe() {}
    offMe() {}
}

Tool.Line = class extends Tool {
    constructor() {
        super("Line");
    }
}
Tool.Rect = class extends Tool {
    constructor() {
        super("Rect");
    }
}
Tool.MutiShape = class extends Tool {
    constructor() {
        super("MutiShape");
    }
}
Tool.Pen = class extends Tool {
    constructor() {
        super("Pen");
    }
}
Tool.Pencil = class extends Tool {
    constructor() {
        super("Pencil");
    }
}
Tool.Text = class extends Tool {
    constructor() {
        super("Text");
    }
}
Tool.Mirror = class extends Tool {
    constructor() {
        super("Mirror");
    }
}
Tool.Rotate = class extends Tool {
    constructor() {
        super("Rotate");
    }
}