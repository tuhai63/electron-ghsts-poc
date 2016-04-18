import angular from 'angular';
import {ValueStruct, IdentifierStruct} from '../common/sharedModel.js';
import {Receiver, Sender} from './receiverModel.js'
import uuid from 'node-uuid';

class ReceiverController {
    constructor($mdDialog, ReceiverService, LegalEntityService) {
        this.receiverService = ReceiverService;
        this.legalEntityService = LegalEntityService;
        this.$mdDialog = $mdDialog;        
        this.selected = null;
        this.receivers = [];
        this.selectedIndex = 0;
        this.filterText = null;
        this.regulatoryAuthorityOptions = [];  
        this.nonRALegalEntityOptions = [];
                
        // Load options for LE selects   
        this.getRegulatoryAuthorities();
        this.getNonRALegalEntities();
        
        // load receiver data
        this.getAllReceivers();
    }      
  
    selectReceiver(receiver, index) {
        this.selected = angular.isNumber(receiver) ? this.receivers[receiver] : receiver;
        this.selectedIndex = angular.isNumber(receiver) ? receiver: index;
    }
    
    deleteReceiver($event) {
        let confirm = this.$mdDialog.confirm()
                                .title('Are you sure?')
                                .content('Are you sure you want to delete this receiver?')
                                .ok('Yes')
                                .cancel('No')
                                .targetEvent($event);
        
        this.$mdDialog.show(confirm).then(() => {
            let self = this;
            self.receiverService.deleteReceiver(self.selected._id)
                .then(affectedRows => self.receivers.splice(self.selectedIndex, 1));
            });
    }
    
    saveReceiver($event) {
        let self = this;
        if (this.selected != null && this.selected._id != null) {
            this.receiverService.updateReceiver(this.selected).then(function (affectedRows) {
                self.$mdDialog.show(
                    self.$mdDialog
                        .alert()
                        .clickOutsideToClose(true)
                        .title('Success')
                        .content('Data Updated Successfully!')
                        .ok('Ok')
                        .targetEvent($event)
                );
            });
        }
        else {            
            this.receiverService.createReceiver(this.selected).then(affectedRows => 
                self.$mdDialog.show(
                    self.$mdDialog
                        .alert()
                        .clickOutsideToClose(true)
                        .title('Success')
                        .content('Data Added Successfully!')
                        .ok('Ok')
                        .targetEvent($event)
                )
            );
        }
    }
    
    createReceiver() {
        // create a new receiver and set defaults
        let rcvr = new Receiver();
        rcvr._identifier = uuid.v4();    
        rcvr.METADATA_STATUS = new ValueStruct();

        this.selected = rcvr;
        this.selectedIndex = null;
    }
    
    getAllReceivers() {
        let self = this;
        this.receiverService.getReceivers().then(receivers => {
            self.receivers = [].concat(receivers);
            self.selected = receivers[0];
        });
    }
    
    filterReceiver() {
        if (this.filterText == null || this.filterText == "") {
            this.getAllReceivers();
        }
        else {            
            this.receiverService.getReceiverByName(this.filterText).then(receivers => {
                this.receivers = [].concat(receivers);
                this.selected = receivers[0];
            });
        }
    }
    
    // get a list of RAs to be Receiver LE
    getRegulatoryAuthorities(){
        let self = this;
        this.legalEntityService.getRegulatoryAuthorities().then(list => {            
            list.forEach(le => {               
                let option = {id: le._identifier, name: le.LEGALENTITY_NAME}; 
                // console.log(JSON.stringify(option))
                self.regulatoryAuthorityOptions.push(option);
            })
        })
    }
    
    // get a list of Non-RAs to be Sender LE
    getNonRALegalEntities(){
        let self = this;
        this.legalEntityService.getNonRALegalEntities().then(list => {            
            list.forEach(le => {               
                let option = {id: le._identifier, name: le.LEGALENTITY_NAME}; 
                // console.log(JSON.stringify(option))
                self.nonRALegalEntityOptions.push(option);
            })
        })
    }
    
    getReceiverLegalEntityByLEId(leId){
        let self = this;
        this.legalEntityService.getLegalEntityByLEId(leId).then(le => {
            // console.log(JSON.stringify(le))
            let leJson = JSON.stringify(le);            
            self.$mdDialog.show(
                    self.$mdDialog
                        .alert()
                        .clickOutsideToClose(true)
                        .title('Receiver LE JSON')
                        .content(leJson)
                        .ok('Ok')
            );
        })
    }
    
    getSenderLegalEntityByLEId(leId){
        let self = this;
        this.legalEntityService.getLegalEntityByLEId(leId).then(le => {
            //console.log(JSON.stringify(le))
            let leJson = JSON.stringify(le);            
            self.$mdDialog.show(
                    self.$mdDialog
                        .alert()
                        .clickOutsideToClose(true)
                        .title('Sender LE JSON')
                        .content(leJson)
                        .ok('Ok')
            );
        })
    }
    
    viewReceiverJson($event) {
        let self = this;
        if (this.selected != null && this.selected._id != null) {
            let rcvrJson = JSON.stringify(this.selected);            
            self.$mdDialog.show(
                    self.$mdDialog
                        .alert()
                        .clickOutsideToClose(true)
                        .title('Receiver JSON')
                        .content(rcvrJson)
                        .ok('Ok')
                        .targetEvent($event)
            );
        }
    }
    
    viewReceiverGHSTS($event) {
        let self = this;
        if (this.selected != null && this.selected._id != null) {   
            this.receiverService.getReceiverGHSTSById(this.selected._id).then(xml =>              
                self.$mdDialog.show(
                        self.$mdDialog
                            .alert()
                            .clickOutsideToClose(true)
                            .title('Receiver GHSTS')
                            .content(xml)
                            .ok('Ok')
                            .targetEvent($event)
                    )
            );
        };
    }
    
    initializeRcvr(){
        // read from sample ghsts and populate the database with legal entities.       
        this.receiverService.initializeReceivers();
    }
    
    addTestRcvr(){
        // read from sample ghsts and populate the database with legal entities.       
        this.receiverService.addReceiverToDB();
    }
}

ReceiverController.$inject = ['$mdDialog', 'receiverService', 'legalEntityService'];

export { ReceiverController }

