// 使用时间戳看看微秒内的重复率
let d = new Map();
let len = 1000000;

for (let i = 0; i < len; i++) {
    let t = Date.now();
    d.set(t, t);
}
console.log("经典时间戳重复率: ", 1 - d.size / len);

let __ct = 0;
let __lastTime = 0;

function createID() {
    let t = Date.now()
    if (t - __lastTime > 1000) {
        __lastTime = t;
        __ct = 0;
    }
    __ct++;
    return t + __ct;
}

d = new Map();
for (i = 0; i < len; i++) {
    let t = createID();
    d.set(t, t);
}
console.log("时间戳+累加循环重复率[1s]: ", 1 - d.size / len);

d = new Map();
let c = 0;
for (i = 0; i < len; i++) {
    c++;
    d.set(c, c);
}
console.log("累加重复率: ", 1 - d.size / len);

d = new Map();
c = "0";
for (i = 0; i < len; i++) {
    c = add(c, "1");
    d.set(c, c);
}
console.log("add.js累加重复率: ", 1 - d.size / len);