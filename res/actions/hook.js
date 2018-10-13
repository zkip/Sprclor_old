let package = () => {}
addEventListener("load", () => {
    let head = document.querySelector("head");
    let util = {
        lastChar: (str) => {
            return str.length === 0 ? "" : str[str.length - 1];
        },
        lastEle: (arr) => {
            return arr[arr.length - 1];
        },
    }
    class Resource {
        constructor() {
            this.path = new Paths();
            this.src = new Map();
        }
        // 生成资源描述
        set(name, URI) {
            this.src.set(name, URI);
        }
        // 依赖库
        lib() {}
        // font to iconFont
        f2if() {}
        // iconFont
        icf() {}
        // 获取资源到缓存
        // 资源的类型要到fetch之后才能获得
        fetch() {
            // 
        }
        // 从其它Resource获取资源请求
        loadFrom(res) {
            // 
        }
    }
    let localhost = "localhost://:7009";
    class Paths {
        constructor(dir) {
            this.base = Paths.join(dir || "");
        }
        dir(dir) {
            return new Paths(dir);
        }
        local(src) {
            let _src = Paths.join(this.base, src);
            return conv2HTTPfs.call(null, localhost, _src);
        }
        locals(...srcs) {
            let me = this;
            return srcs.map((v, i, arr) => {
                return arr[i] = me.local(v);
            });
        }
        // 依次返回相同名称对应后缀名的URI
        samename(name, ...ext) {
            let me = this;
            return ext.map((v, i, arr) => {
                return conv2HTTPfs.call(null, localhost, Paths.join(me.base, Paths.joinName(name, v)));
            });
        }
        // 依次返回相同后缀名对应名称的URI
        sameext(ext, ...name) {
            let me = this;
            return name.map((v, i, arr) => {
                return conv2HTTPfs.call(null, localhost, Paths.join(me.base, Paths.joinName(v, ext)));
            });
        }
    }
    Object.assign(Paths, {
        // 添加新的路径
        // ...str:str
        join: (...str) => {
            let rs = [],
                quot = "";
            let isFR = false;
            if (str.length > 0) {
                for (let i = 0; i < str.length; i++) {
                    let s = str[i].replace(/(\\|\/)+/g, "/");
                    let ss = s.split(/\\|\//g);
                    for (let j = 0; j < ss.length; j++) {
                        let _s = ss[j];
                        if (i === 0 && j === 0) {
                            let f = s.indexOf(":");
                            if (f < 0) {
                                s[0] === "/" && (rs.splice(0, 0, ""), isFR = true);
                            } else {
                                isFR = true;
                            }
                        }
                        if (_s === "..") {
                            if (!(rs.length === 1 && isFR)) {
                                rs.pop();
                            }
                        } else if (_s === "." || _s === "") {
                            continue;
                        } else {
                            rs.push(_s);
                        }
                    }
                }
            }
            return rs.join("/");
        },
        splitName: (name) => {
            let f = name.lastIndexOf(".");
            return [name.slice(0, f), name.slice(f + 1)];
        },
        joinName: (name, ext) => {
            ext = ext.replace(/\.*/g, "");
            return name + "." + ext;
        },
        conv2HTTPfs: (url, src) => {
            return url + "/read?arg=" + src;
        },
    })

    let cRes = new Resource();
    let pkgFns = new Map();
    let installedPkg = new Map();
    let isInstalled = new Map();
    package = (name, fn, res) => {
        if (pkgFns.get(name)) return;
        pkgFns.set(name, fn);
        let resPkg = new Resource();
        res(resPkg);
        cRes.loadFrom(resPkg);
    }

    // 加载package
    function load(src) {
        let script = document.createElement("script");
        script.src = src;
        head.appendChild(script);
    }

    // 安装package
    function install(name, ...owner) {
        if (isInstalled.get(name)) {
            return installedPkg[name];
        } else {
            isInstalled.set(name, true);
            let ip = pkgFns.get(name).call(owner.length > 0 ? owner[0] : ins);
            installedPkg.set(name, ip);
            return ip;
        }
    }

    // 丢弃package
    function dump() {
        // 
    }

    // load("/package/paper/lib/paper-full.min.js");
    // console.log(paper);
})

function assign(target, ops, ...keys) {
    if (typeof target === "function") {
        if (typeof ops === "function") {
            assign(target.prototype, ops.prototype, Object.getOwnPropertyNames(ops.prototype));
        } else {
            assign(target.prototype, ops);
        }
    } else {
        if (keys.length > 0) {
            for (let i = 0; i < keys[0].length; i++) {
                let k = keys[0][i];
                if (k === "constructor") continue;
                target[k] = ops[k];
            }
        } else {
            for (let k in ops) {
                if (k === "constructor") continue;
                target[k] = ops[k];
            }
        }
        return target;
    }
}