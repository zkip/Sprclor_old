addEventListener("load",()=>{
    let stage=document.querySelector(".stage");
    let user=new User({
        name: "lightbee",
        pwd: "eJack_j34",
    });
    let session=user.login();
    session.subscribe("ok",()=>{
        // 登陆成功
        // 获取世界信息
        let WDS_R=user.getWorldDetail();

        WDS_R.subscribe("ok",(wds)=>{
            // ...
            let name=wds.get(0);
            // 连接到世界
            user.connect(name).subscribe("ok",(ch)=>{
                // 绑定实体
                ch.bindSolid(stage);
                
            });
        });
    }).subscribe("faild",(result)=>{
        console.log("login faild: ",result);
    }).catch(err=>console.error(err));
})