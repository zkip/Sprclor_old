function res(res) {
    res.depend("paper.js");
    // 本地资源
    let {
        path: {
            dir,
            local,
        },
        f2if,
        icf,
    } = res;
    // 设置相对路径
    res.set("packageIcon", local("avatar.ico"));
    let l = dir(local("d://res/paper"));
    res.set("packageIcon", l.local("avatar.ico"));

    // http
    res.set("baiduLogo", http.get("https://www.baidu.com/logo.jpg"));
    let h = http.base("https://www.baidu.com/images");
    res.set("baiduImage-mouse", h.get("mouse.png"));

    // 字体图标
    let font = l.samename("iconFonts/paper", "eot", "ttf", "woff");
    let icfCss = l.local("iconFonts/paper.css");
    let icf = f2if(font, icfCss);
    let icf2 = l.local("iconFonts/paper.eot", "iconFont").css("iconFonts/paper.css");
    let icf3 = icf.load(l.dir("iconFonts").locals("paper.eot", "paper.ttf", "paper.woff"), http("https://xxx.xxx/paper.css"));
    res.set("toolIcon-picker", icf.get("icon-compass"));

    // Sprite
    let s = l.local("test.png", "sprite").config("config.json");
    res.set("test-icon", s.position(0, 0, 200, 400));
}