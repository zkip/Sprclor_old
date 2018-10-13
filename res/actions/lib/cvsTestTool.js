class Vector {
    constructor(x, y) {
        this.x = 0;
        this.y = 0;
        this.set(x, y);
    }
    len() {
        let {
            sqrt,
            pow
        } = Math;
        return sqrt(pow(this.x, 2) + pow(this.y, 2));
    }
    normalize() {
        let len = this.len();
        if (len) {
            this.x /= len;
            this.y /= len;
        }
        return this;
    }
    set(x, y) {
        let _x = (x && x.x) || x || 0,
            _y = (x && x.y) || y || 0;
        typeof _x === "number" && (this.x = _x);
        typeof _y === "number" && (this.y = _y);
        return this;
    }
    scale(v, y) {
        if (typeof v === "object") {
            this.x *= v.x || 1;
            this.y *= v.y || 1;
        } else {
            this.x *= v;
            this.y *= typeof y === "number" ? y : v;
        }
        return this;
    }
    rotate(angle) {
        return this.rotateByRadians(angle / 180 * Math.PI);
    }
    add(v) {
        return new Vector(this.x + v.x, this.y + v.y);
    }
    subtract(v) {
        return new Vector(this.x - v.x, this.y - v.y);
    }
    // Vector/number : Vector
    multiply() {
        let v = new Vector(this);
        return v.scale.apply(v, arguments);
    }
    // Vector/number : Vector
    divide(v) {
        if (typeof v === "number") {
            return new Vector(this.x / v, this.y / v);
        } else {
            return new Vector(this.x / v.x, this.y / v.y);
        }
    }
    // Vector/number : Vector
    modulo(v) {
        if (typeof v === "number") {
            return new Vector(this.x % v, this.y % v);
        } else {
            return new Vector(this.x % v.x, this.y % v.y);
        }
    }
    negate() {
        return new Vector(-this.x, -this.y);
    }
    // : number
    dot(v) {
        return this.x * v.x + this.y + v.y;
    }
    cross() {
        return this.x * v.y - this.y * v.x
    }
    rotateByRadians(angle) {
        let len = this.len();
        let _ = this.getAngleByRadians();
        this.setAngleByRadian(_ + angle)
        return this;
    }
    getAngle() {
        return this.getAngleByRadians() * 180 / Math.PI;
    }
    setAngle(angle) {
        return this.setAngleByRadian(angle * Math.PI / 180);
    }
    getAngleByRadians() {
        if (this.len()) {
            return Math.atan2(this.y, this.x);
        }
        return 0;
    }
    setAngleByRadian(angle) {
        let len = this.len();
        this.set(Math.cos(angle) * len, Math.sin(angle) * len);
        return this;
    }
    getQuadrant() {
        return this.x >= 0 ? this.y >= 0 ? 1 : 4 : this.y >= 0 ? 2 : 3;
    }
    draw(ctx, opt) {
        opt = checkOpt(opt, {
            len: "self",
            pos: new Point(),
            color: '#333',
            drawArrow: true,
        });

        let len = opt.len === "self" ? this.len() : opt.len;
        let angle = this.getAngleByRadians();
        let arrowSize = 5;
        let width = 1;
        // let v = this.multiply(opt.len);
        // v.normalize().scale(opt.len);

        // line
        ctx.save();
        ctx.beginPath();
        ctx.translate(opt.pos.x, opt.pos.y);
        ctx.rotate(angle);
        ctx.moveTo(0, 0);
        ctx.lineTo(len, 0);
        ctx.strokeStyle = opt.color;
        ctx.lineWidth = width;
        ctx.stroke();

        if (opt.drawArrow) {
            // arrow
            ctx.beginPath();
            ctx.moveTo(len - arrowSize, -arrowSize);
            ctx.lineTo(len, 0);
            ctx.lineTo(len - arrowSize, arrowSize);
            ctx.stroke();
        }
        ctx.restore();
    }
}
class Point {
    constructor(x, y) {
        this.x = 0;
        this.y = 0;
        this.set(x, y);
    }
    set(x, y) {
        let _x = (x && x.x) || x || 0,
            _y = (x && x.y) || y || 0;
        typeof _x === "number" && (this.x = _x);
        typeof _y === "number" && (this.y = _y);
        return this;
    }
    draw(ctx, opt) {
        opt = checkOpt(opt, {
            size: 5,
            fillColor: '',
            strokeColor: '#333',
        });
        ctx.save()
        ctx.beginPath();
        ctx.translate(this.x, this.y);
        ctx.arc(0, 0, opt.size, 0, Math.PI * 2);
        if (opt.fillColor) {
            ctx.fillStyle = opt.fillColor;
            ctx.fill();
        }
        if (opt.strokeColor) {
            ctx.strokeStyle = opt.strokeColor;
            ctx.stroke();
        }
        ctx.restore();
    }
}
class Renderer {
    constructor() {
        this.pool = new Map();
        this.opts = new Map();
        this.count = 0;
    }
    add(vs, ...opt) {
        let isOpt = opt.length > 0;
        vs = vs instanceof Array ? vs : [vs];
        vs.forEach(v => {
            this.pool.set(v, v);
            isOpt && this.opts.set(v, opt[0]);
        })
        return this;
    }
    render(ctx) {
        let me = this;
        this.count++;
        me.pool.forEach(v => {
            v.draw(ctx, me.opts.get(v), {
                dt: me.count
            });
        });
    }
}

function checkOpt(opt, _) {
    opt = opt || _;
    for (let k in _) {
        typeof opt[k] === "undefined" && (opt[k] = _[k]);
    }
    return opt;
}

function setup(cvs, fn) {
    let render = new Renderer();
    if (typeof cvs === "string") {
        addEventListener("load", () => {
            setup(document.querySelector(cvs), fn)
        });
        return;
    }
    cvs.style.position = "absolute";
    cvs.style.left = "0";
    cvs.style.top = "0";
    let ctx = cvs.getContext("2d");
    let w = innerWidth,
        h = innerHeight;
    let needReSetBound = true;
    let mpos = new Point();

    addEventListener("resize", () => {
        w = innerWidth;
        h = innerHeight;
        needReSetBound = true;
    })
    addEventListener("mousemove", e => {
        let {
            clientX,
            clientY
        } = e;
        mpos.set(clientX, clientY);
    });
    fn({
        mpos: mpos,
        render: render,
        dom: cvs,
        ctx: ctx,
    });
    let _ = () => {
        if (needReSetBound) {
            cvs.width = w;
            cvs.height = h;
            needReSetBound = false;
        }
        // ctx.clearRect(0, 0, innerWidth, innerHeight);
        // render.render(ctx);
        // requestAnimationFrame(_);
    }
    _();
}