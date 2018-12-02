{
    class Inspector extends UI {
        constructor(d) {
            super("Inspector", d);
        }
    }
    UI.Inspector = Inspector;

    class Slider extends UI {
        constructor(tx) {
            super("Slider", document.createElement("div"));
            assign(this, {
                label: tx,
                ev: new MEvent("change"),
            })
            let me = this;
            let root = this.dom;
            root.classList.add("Slider");
            let range = document.createElement("input");
            let label = document.createElement("span");
            label.classList.add("label");
            label.textContent = this.label;
            range.type = "range";
            range.max = 1;
            range.min = -1;
            range.step = 0.001;
            range.value = 0;
            range.addEventListener("input", e => {
                me.ev.execute("change", e);
            })
            root.appendChild(label);
            root.appendChild(range);
            let dmms = new Map();
            dmms.set("range", range);
            this.getValue = () => range.value;
            this.getDom = (name) => {
                return dmms.get(name);
            }
        }
        setValue(value) {
            this.getDom("range").value = value;
        }
        getValue() {
            return this.getDom("range").value;
        }
        setRange(min, max) {
            let range = this.getDom("range");
            range.min = min;
            range.max = max;
        }
    }
    UI.Slider = Slider;
}