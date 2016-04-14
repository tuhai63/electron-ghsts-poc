import {GHSTS} from '../common/ghsts.js'
import {ContactPerson, ContactAddress, LegalEntity} from '../legal_entity/legalEntityModel.js';
import {Receiver, Sender} from '../receiver/receiverModel.js'
import {ValueStruct, IdentifierStruct} from '../common/sharedModel.js'

class GhstsService {
    constructor(ReceiverService, LegalEntityService) {
        this.receiverService = ReceiverService;
        this.legalEntityService = LegalEntityService;  
    }
            
    assembleDemoGHSTS(){          
        // read from existing ghsts.xml for most of the objects
        let ghsts = new GHSTS("./app/browser/data/ghsts.xml");     
        let promise = ghsts.readObjects();
        let self = this;
        // listen for both fulfillment and rejection        
        promise.then(function(contents) {
            console.log('read from xml into obj.  now about to read from database to get the objects');            

            // add legal entities from database to GHSTS
            let leListPromise = self.legalEntityService.getLegalEntities(); 
            leListPromise.then(function(leList) {
                // console.log('get le lists', leList)                
                leList.forEach(le => { 
                    let leObj = new LegalEntity(le);
                    ghsts.addLegalEntity(leObj.toGHSTSJson());
                });

                // add receivers from database to GHSTS
                let rcvrListPromise = self.receiverService.getReceivers(); 
                rcvrListPromise.then(function(rcvrList) {                    
                    rcvrList.forEach(receiver => {
                        let rcvrObj = new Receiver(receiver);
                        // console.log('receiver json ', rcvrObj.toGHSTSJson())     
                        ghsts.addReceiver(rcvrObj.toGHSTSJson());
                        
                        // now we got everything, produce the GHSTS file.
                        //console.log('the le ghsts xml: ' + le.toGHSTSJson());
                        ghsts.writeXML("./app/browser/data/DemoGHSTS.xml");
                        console.log('written to ./app/browser/data/DemoGHSTS.xml'); 
                    });
                })
            })
        }, function(err) {
            // rejection
            console.error(err.message);
        });    
    }        
}

GhstsService.$inject = [ 'receiverService', 'legalEntityService'];

export { GhstsService }


