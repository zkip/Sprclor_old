class Vector {
    constructor() {
        this.x = 0;
        this.y = 0;
        this.z = 0;
    }
}
function getDistance(p1, p2) {
    return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
}
