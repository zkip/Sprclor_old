importScripts("/lib/dexie.min.js")
let db=new Dexie("MyTest");
db.version(1).stores({
    pages: "id, userName, userID, status",
});
db.open();

let d=null;
addEventListener("message",(e)=>{
    let {data}=e;
    let {id}=e.source;
    if(data===0){
        db.pages.delete(id);
    }else{
        let {type}=data;
        if(type==="login"){
            let {name,pwd,uID}=e.data;
            // verify
            db.pages.add({
                id: id,
                userName: name,
                userID: uID,
                status: 0,
            });
        }else if(type==="update"){
            // 获取所有的页面
            db.pages.where({userID: "1001"}).each((d)=>{
                self.clients.get(d.id).then((c)=>{
                    // console.log(c);
                    c.postMessage({
                        type: "publish",
                        keyPath: "pos",
                        data: data.data,
                    })
                })
            })
        }
    }
})
addEventListener("install",(e)=>{
    console.log(e);
})
addEventListener("activate",(e)=>{
    console.log(e);
})