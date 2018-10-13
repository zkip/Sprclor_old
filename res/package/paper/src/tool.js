class Picker extends this.Tool {
    constructor(v) {
        super("Picker");
    }
    onMe() {

    }
    offMe() {

    }
    onDead() {

    }
    event() {
        let {
            view
        } = this;
        return {
            mousedown: {
                fn: (e) => {},
                target: "work",
            },
            mousemove: {
                fn: (e) => {},
            },
            mousemove: {
                fn: (e) => {
                    // 
                },
                target: "work",
            },
            mouseup: {
                fn: (e) => {},
            },
        }
    }
}
