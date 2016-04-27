import angular from 'angular';

class ContactPersonController {
    constructor(contactPerson, legalEntityController, $mdDialog) {
        this.legalEntityController = legalEntityController;
        this.$mdDialog = $mdDialog;  
        this.contactPerson = contactPerson; 
        if(contactPerson === {}){
            this.addMode = true;
        }
    }      
  
    cancel($event) {
        this.$mdDialog.cancel();
    };    

    saveContactPerson($event) {
        this.legalEntityController.saveContactPerson(this.contactPerson, this.addMode);  
        this.$mdDialog.hide();
    } 
}

ContactPersonController.$inject = ['contactPerson', 'legalEntityController', '$mdDialog'];

export { ContactPersonController }

