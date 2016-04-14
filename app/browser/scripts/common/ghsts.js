import xml2js from 'xml2js';
import path from 'path';
var fs = require('fs');

class GHSTS {    
    constructor(filename){
        this.filename = filename;
        this.ghsts = {};
        this.legalEntities = [];
        this.receivers = [];
        // add other sub objects here
    }          
    
    addLegalEntity(legalEntity){
        this.legalEntities.push(legalEntity);
    }
    
    setLegalEntities(legalEntities){
        this.legalEntities = legalEntities;
    }
    
    addReceiver(receiver){
        this.receivers.push(receiver);
    }
    
    setReceivers(receivers){
        this.receivers = receivers;
    }
    
    readObjects() {     
        // read json objects from ghsts xml    
        let self = this;
        return new Promise(function(resolve, reject) {
            fs.readFile(self.filename, { encoding: "utf8" }, function (err, xmlStr) {
                if (err) throw (err);
                // parse the xml to json object                
                xml2js.parseString(xmlStr, {attrkey: 'attr$' },  function(err, obj) {
                    // check for errors
                    if (err) {
                        reject(err);
                    }
                    // the read succeeded
                    resolve(obj);      
                    self.ghsts = obj.GHSTS;  
                    
                    // set legal entities
                    self.legalEntities = obj.GHSTS.LEGAL_ENTITIES[0].LEGAL_ENTITY;  
                    // set receivers 
                    self.receivers = obj.GHSTS.RECEIVERS[0].RECEIVER;  
                    // set other objects here
                    // ...
                })
            }); 
        })
    }   
    
    writeXML(filename){
        // write ghsts json tree back to xml
        let builder = new xml2js.Builder({rootName: 'GHSTS', attrkey: 'attr$'});
        let xml = builder.buildObject(this.ghsts);        
        fs.writeFile(filename, xml, function (err) {
            if (err) console.log(err); 
        });
    }
}

export {GHSTS}