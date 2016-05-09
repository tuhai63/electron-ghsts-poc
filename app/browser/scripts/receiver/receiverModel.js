
class Sender {
    constructor(json){   
        if(arguments.length === 1){
            // load from json
            Object.assign(this, json);
        }else{  
            this._toLegalEntityId = null;  
            this.COMPANY_CONTACT_REGULATORY_ROLE = 'Sender';
            this.REMARK = null;
        }
    }  
    
    set toLegalEntityId(id){
        this._toLegalEntityId = id;
    }  
    
    toGHSTSJson() {   
        return {
            attr$ : {  To_Legal_Entity_Id : this._toLegalEntityId  },
            COMPANY_CONTACT_REGULATORY_ROLE  : this.COMPANY_CONTACT_REGULATORY_ROLE,            
            REMARK  : this.REMARK 
        };          
    }
}    

class Receiver {
    constructor(json){  
        if(arguments.length === 1){
            // load from json
            Object.assign(this, json);
        }else{          
            this._identifier = null;      
            this._toLegalEntityId = null;        
            this.METADATA_STATUS = {};         // of ValueStruct
            this.SHORT_NAME = null;
            this.ROLE = 'Recipient';
            this.SENDER = [];                  // list of Senders
        }     
    }
    
    set receiverId(id){
        this._identifier = id;
    }
    
    set toLegalEntityId(id){
        this._toLegalEntityId = id;
    }    
    
    addSender(sender){
        this.SENDER.push(sender);
    }
     
    toGHSTSJson() {
        let sendersJson = [];
        // convert senders Json to GHSTSJson
        this.SENDER.forEach(sender => {
            let senderObj = new Sender(sender);
            sendersJson.push(senderObj.toGHSTSJson());
        }); 
             
        return {            
            attr$ : {  Id : this._identifier, To_Legal_Entity_Id : this._toLegalEntityId  },
            METADATA_STATUS  : this.METADATA_STATUS,            
            SHORT_NAME  : this.SHORT_NAME,
            ROLE : this.ROLE,
            SENDER : sendersJson
        };               
    }          
}    

export {Sender, Receiver}