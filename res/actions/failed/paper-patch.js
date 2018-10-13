paper.Group.prototype.move = function (idx, nIdx) {
    let item = this.removeChildren(idx, idx + 1);
    if (item.length === 0) return;
    this.insertChildren(nIdx, item);
    return item[0];
}