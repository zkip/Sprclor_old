addEventListener("load",()=>{
    let stage=document.querySelector(".stage");
    let user=new User({
        name: "lightbee",
        pwd: "93982jfd",
    });
    // let user=new User(); // 游客账号
    let session=user.login();
    session.subscribe("ok",()=>{
        user.connect("material-icon").subscribe("ok",(channel)=>{
            channel.setSolidTarget(stage).subscribe("ok",()=>{
                
            }).catch(err=>console.log(err));
        }).catch(err=>console.log(err));;
    });
})