class Channel {
    constructor(){

    }
    setSolidTarget(dom){
        let me=this;
        return new Observable.create((observer)=>{
            if(dom instanceof HTMLElement){
                let toolBox=me.getCurrentToolBox();
                let tools=toolBox.getTools();
                observer.next();
                observer.compelet();
            }else{
                observer.error();
            }
        });
    }
    // :Tools
    getTools(){

    }
    // :ToolBox
    getCurrentToolBox(){

    }
}

class Tools extends Collection {
    constructor(){

    }
    // []:Tool
    getAll(){

    }
}
