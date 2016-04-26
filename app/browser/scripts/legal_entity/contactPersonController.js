import angular from 'angular';

class ContactPersonController {
    constructor(contactPerson, $mdDialog, LegalEntityService) {
        this.legalEntityService = LegalEntityService;
        this.$mdDialog = $mdDialog;  
        this.contactPerson = contactPerson; 
    }      
  
    cancel($event) {
        this.$mdDialog.cancel();
    };    
    
    saveContactPerson($event) {
        this.$mdDialog.hide();  
    } 
}

ContactPersonController.$inject = ['contactPerson', '$mdDialog', 'legalEntityService'];

export { ContactPersonController }

