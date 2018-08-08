class User {
    constructor(){

    }
    // 连接到空间
    // string:(Channel)
    connect(name){

    }
    // 获取空间信息
    // WorldQueryOption:(WorldDetailCollection)
    getWorldDetail(qOpt){
        
    }
    // 获取物品信息
    // UserQueryOption:(ItemDetailCollection)
    getItemDetail(qOpt){

    }
}

class QueryOption {}

class UserQueryOption extends QueryOption {
    constructor(){
        let opt={
            "type": ["Tool","Item","Card","Space"],
        }
    }
}