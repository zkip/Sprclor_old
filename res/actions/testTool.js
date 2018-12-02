function NewDom(t) {
    return document.createElement(t);
}
class DomE extends HTMLElement {
    constructor() {
        super();
    }
    connectedCallback() {}
    disconnectedCallback() {}
    adoptedCallback() {}
    attributeChangedCallback() {}
    // Dom
    addOn(d) {
        d.appendChild(this);
        return this;
    }
    rmMyself() {
        this.parentNode.removeChild(this);
        return this;
    }
}
class Group extends DomE {
    constructor() {
        super();
    }
}
// class Button extends DomE {
//     constructor() {
//         super();
//         this.classList.add("Button");
//     }
// }
class Radio {}
class Option {}
class IptTx {}
class Tx {}

customElements.define("x-base", DomE);
customElements.define("x-group", Group);
// customElements.define("x-btn", Button);