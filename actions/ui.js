// UI逻辑与数据逻辑是完全独立的，它们之间通过事件流进行交流

let dataStream=getDataStream();
dataStream.subscribe("dataStream");

let runBtn=document.querySelector("#jjer23");
dataStream.subscribe("")
runBtn.addEventListener("mousedown",(e)=>{
    dataStream.next("");
});

