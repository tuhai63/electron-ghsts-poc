import angular from 'angular';
import {_} from 'lodash';

class ContactPersonController {
    constructor(contactPerson, legalEntityController, $mdDialog) {
        this.legalEntityController = legalEntityController;
        this.$mdDialog = $mdDialog;  
        this.contactPerson = contactPerson; 
        this.isAddMode = false;
        if(_.isEmpty(contactPerson) === true){
            this.isAddMode = true;
        }
    }      
  
    cancel($event) {
        this.$mdDialog.cancel();
    };    

    saveContactPerson($event) {
        this.legalEntityController.saveContactPerson(this.contactPerson, this.isAddMode);  
        this.$mdDialog.hide();
    } 
}

ContactPersonController.$inject = ['contactPerson', 'legalEntityController', '$mdDialog'];

export { ContactPersonController }

