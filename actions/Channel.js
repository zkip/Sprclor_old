class Channel {
    // Observable:
    constructor(sub) {
        this.sub=sub;
        this.renderers={};
    }
    linkRenderer(renderer){
        this.sub.subscribe(()=>{});
        this.renderers[renderer.ID]=renderer;
    }
    unlinkRenderer(ID){
        delete this.renderers[ID];
    }
    onDestoryed(){
        
    }
}
