import angular from 'angular';
import {ContactPerson} from './legalEntityModel.js';

class ContactPersonController {
    constructor($mdDialog, LegalEntityService) {
        this.legalEntityService = LegalEntityService;
        this.$mdDialog = $mdDialog;  
        this.contactPerson = {}; 
    }      
  
    cancel($event) {
        this.$mdDialog.cancel();
    };    
    
    saveContactPerson($event) {
        this.$mdDialog.hide();  
    } 
}

ContactPersonController.$inject = ['$mdDialog', 'legalEntityService'];

export { ContactPersonController }

