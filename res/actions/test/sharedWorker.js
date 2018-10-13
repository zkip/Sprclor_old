let portMs = new Map();
addEventListener("connect", (e) => {
    let port = e.ports[0];
    let id = Date.now() + "" + genID();
    portMs.set(port, id);
    port.start();
    port.addEventListener("message", (e) => {
        if (e.data === 0) {
            port.close();
            portMs.delete(port);
            portMs.forEach((id, p) => {
                p.postMessage({
                    flag: 0,
                    target: id,
                });
            });
        }
    });
});

let count = 0;

function genID() {
    return count++;
}