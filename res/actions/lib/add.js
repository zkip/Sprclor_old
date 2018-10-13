function add(v1, v2) {
    v1 = (v1 + '').replace(/\s/g, '');
    v2 = (v2 + '').replace(/\s/g, '');
    let ret = '';

    let gap = v1.length - v2.length;
    let i = (gap > 0 ? v1.length : v2.length) - 1;
    // 偏移补偿
    let ag = 0,
        bg = 0;
    gap > 0 ? bg = gap : ag = -gap;

    let dc = 0; // 进数
    while (v1[i - ag] || v2[i - bg]) {
        let a = v1[i - ag] ? v1[i - ag] * 1 : 0,
            b = v2[i - bg] ? v2[i - bg] * 1 : 0;
        // 本数
        let os = (a + b + dc) % 10;
        ret = os + ret;
        dc = (a + b + dc) / 10 >> 0;
        i--;
    }
    // 最后进数
    if (dc) {
        ret = dc + ret;
    }
    return ret;
}