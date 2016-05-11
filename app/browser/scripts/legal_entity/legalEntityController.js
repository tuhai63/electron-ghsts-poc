import angular from 'angular';
import {ContactPersonController} from './contactPersonController';
import {ValueStruct} from '../common/sharedModel';
import {LegalEntityIdentifier, LegalEntity} from './legalEntityModel';
import uuid from 'node-uuid';
import {_} from 'lodash';

class LegalEntityController {
    constructor($mdDialog, $mdSidenav, $location, LegalEntityService, PickListService) {
        this.legalEntityService = LegalEntityService;
        this.pickListService = PickListService;
        this.$mdDialog = $mdDialog;        
        this.$mdSidenav = $mdSidenav;
        this.$location = $location;
        this.selected = null;
        this.legalEntities = [];
        this.selectedIndex = 0;
        this.filterText = null;
        
        // options for metadata status
        this.metadataStatusOptions = this.pickListService.getMetadataStatusOptions();
        // options for identifier types
        this.identifierTypeOptions = this.pickListService.getLegalEntityIdentifierTypeOptions(); 
        // options for countries
        this.countryOptions = this.pickListService.getCountryOptions();
        // options for legal entity types
        this.legalEntityTypeOptions = this.pickListService.getLegalEntityTypeOptions();
        
        // Load initial data
        this.getAllLegalEntities();
    }      
    
    confirmLeavePage($event){
        // confirm with user if the form has been modified before leaving the page   
        var scope = angular.element($event.target.ownerDocument.leForm).scope();    
        let isFormPristine = scope.leForm.$pristine;   
        if(! isFormPristine){
            $event.preventDefault();   
            // ask the user to confirm before leaving page
            let confirm = this.$mdDialog.confirm()
                                .title('Form Modified')
                                .content('Are you sure you want to leave this page?')
                                .ok('Yes')
                                .cancel('No')
                                .targetEvent($event);
        
            this.$mdDialog.show(confirm).then(() => {                
                console.log('taking the user to the page');
                this.$location.path('/home');
            })
        }
    }
    
    _setFormPrestine($event){
        // private - set the to its prestine state after save or update
        var scope = angular.element($event.target.ownerDocument.leForm).scope();    
        scope.leForm.$setPristine();   
    }
    
    toggleSidenav(componentId){
        // toggle the side nave by component identifer 
        this.$mdSidenav(componentId).toggle();
    }
  
    updateSelectedStatusDecode(){
        // update metadata status value decode upon selection change
        let selectedStatusValue = this.selected.METADATA_STATUS.VALUE;
        // find the value decode in themetadata status options
        let leStatusValueDecode = _(this.metadataStatusOptions)
                                        .filter(c => c.VALUE == selectedStatusValue)
                                        .map(c => c.VALUE_DECODE)
                                        .value()[0];
        this.selected.METADATA_STATUS.VALUE_DECODE = leStatusValueDecode;
    }
    
    updateSelectedLETypeDecode(){
        // update legal entity type value decode upon selection change
        let selectedLETypeValue = this.selected.LEGALENTITY_TYPE.VALUE;
        // find the value decode in the legal entity type options
        let leTypeValueDecode = _(this.legalEntityTypeOptions)
                                        .filter(c => c.VALUE == selectedLETypeValue)
                                        .map(c => c.VALUE_DECODE)
                                        .value()[0];
        this.selected.LEGALENTITY_TYPE.VALUE_DECODE = leTypeValueDecode;
    }
    
    updateSelectedCountryDecode(){
        // update country value decode for the selected country upon selection change
        let selectedCountryValue = this.selected.CONTACT_ADDRESS.COUNTRY.VALUE;
        // find the value decode in the country options
        let countryValueDecode = _(this.countryOptions)
                                        .filter(c => c.VALUE == selectedCountryValue)
                                        .map(c => c.VALUE_DECODE)
                                        .value()[0];
        this.selected.CONTACT_ADDRESS.COUNTRY.VALUE_DECODE = countryValueDecode;
    }
  
    updateIdTypeDecodeByIdentifierIndex(identiferIndex){
        // update identifer type value decode by identifier index upon selection change
        let selectedTypeValue = this.selected.LEGALENTITY_IDENTIFIER[identiferIndex].LEGALENTITY_IDENTIFIER_TYPE.VALUE;
        // find value decode from identifierTypeOptions 
        let idTypeValueDecode = _(this.identifierTypeOptions)
                                        .filter(c => c.VALUE == selectedTypeValue)
                                        .map(c => c.VALUE_DECODE)
                                        .value()[0];
        this.selected.LEGALENTITY_IDENTIFIER[identiferIndex].LEGALENTITY_IDENTIFIER_TYPE.VALUE_DECODE = idTypeValueDecode;
    }
   
    selectLegalEntity(legalEntity, index) {
        this.selected = angular.isNumber(legalEntity) ? this.legalEntities[legalEntity] : legalEntity;
        this.selectedIndex = angular.isNumber(legalEntity) ? legalEntity: index;
    }
    
    deleteLegalEntity($event) {
        let confirm = this.$mdDialog.confirm()
                                .title('Are you sure?')
                                .content('Are you sure you want to delete this Legal entity?')
                                .ok('Yes')
                                .cancel('No')
                                .targetEvent($event);
        
        this.$mdDialog.show(confirm).then(() => {
            let self = this;
            self.legalEntityService.deleteLegalEntity(self.selected._id)
                .then(affectedRows => self.legalEntities.splice(self.selectedIndex, 1));
            });
    }
    
    saveLegalEntity($event) {   
        // reset form state
        this._setFormPrestine($event);
                     
        let self = this;
        if (this.selected != null && this.selected._id != null) {
            this.legalEntityService.updateLegalEntity(this.selected).then(function (affectedRows) {
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
            this.legalEntityService.createLegalEntity(this.selected).then(affectedRows => {
                self.$mdDialog.show(
                    self.$mdDialog
                        .alert()
                        .clickOutsideToClose(true)
                        .title('Success')
                        .content('Data Added Successfully!')
                        .ok('Ok')
                        .targetEvent($event)
                );
                
                // refresh the le list
                self.getAllLegalEntities();
            });
        }
    }
    
    createLegalEntity() {
        this.selected = new LegalEntity();
        this.selected.LEGALENTITY_PID = 'urn:' + uuid.v4(); 
        this.selectedIndex = null;
    }
    
    getAllLegalEntities() {
        let self = this;
        this.legalEntityService.getLegalEntities().then(legalEntities => {
            self.legalEntities = [].concat(legalEntities);
            self.selected = legalEntities[0];
        });
    }
    
    filterLegalEntity() {
        if (this.filterText == null || this.filterText == "") {
            this.getAllLegalEntities();
        }
        else {            
            this.legalEntityService.getLegalEntityByName(this.filterText).then(legalEntities => {
                this.legalEntities = [].concat(legalEntities);
                this.selected = legalEntities[0];
            });
        }
    }   
     
    addOtherName(){
        this.selected.OTHER_NAME.push('');
    }
    
    deleteOtherName(otherName, $event){
        let confirm = this.$mdDialog.confirm()
                                .title('Are you sure?')
                                .content('Are you sure you want to delete this Other Name?')
                                .ok('Yes')
                                .cancel('No')
                                .targetEvent($event);
        
        this.$mdDialog.show(confirm).then(() => {
            // delete the specific other name 
            _.pull(this.selected.OTHER_NAME, otherName );
            // update the legal entity            
            this.legalEntityService.updateLegalEntity(this.selected);
        });     
    }
    
    deleteOtherName(otherName, $event){
        let confirm = this.$mdDialog.confirm()
                                .title('Are you sure?')
                                .content('Are you sure you want to delete this Other Name?')
                                .ok('Yes')
                                .cancel('No')
                                .targetEvent($event);
        
        this.$mdDialog.show(confirm).then(() => {
            // delete the specific other name 
            _.pull(this.selected.OTHER_NAME, otherName );
            // update the legal entity            
            this.legalEntityService.updateLegalEntity(this.selected);
        });     
    }
    
    addIdentifier(){
        let IdType = new ValueStruct("DUNS-number", "DUNS-number"); 
        let identifier = new LegalEntityIdentifier(IdType, "")
        this.selected.LEGALENTITY_IDENTIFIER.push(identifier);
    }
    
    deleteIdentifier(identifier, $event){
        let confirm = this.$mdDialog.confirm()
                                .title('Are you sure?')
                                .content('Are you sure you want to delete this Identifier?')
                                .ok('Yes')
                                .cancel('No')
                                .targetEvent($event);
        
        this.$mdDialog.show(confirm).then(() => {
            // delete the specific identifier
            _.remove(this.selected.LEGALENTITY_IDENTIFIER, { IDENTIFIER: identifier });
            // update the legal entity            
            this.legalEntityService.updateLegalEntity(this.selected);
        });             
    }
    
    deleteContactPerson(person, $event){
        let confirm = this.$mdDialog.confirm()
                                .title('Are you sure?')
                                .content('Are you sure you want to delete this Contact Person?')
                                .ok('Yes')
                                .cancel('No')
                                .targetEvent($event);
        
        this.$mdDialog.show(confirm).then(() => {
            // delete the contact person by matching first and last names
            _.remove(this.selected.CONTACT_PERSON, { FIRSTNAME: person.FIRSTNAME, LASTNAME:  person.LASTNAME });
            // update the legal entity            
            this.legalEntityService.updateLegalEntity(this.selected);
        });        
    }   
    
    showContactPersonDiag(person, $event) {
        this.$mdDialog.show( {
            controller: ContactPersonController,
            controllerAs: '_ctrl',
            templateUrl: './scripts/legal_entity/contactPerson.html',
            parent: angular.element(document.body),
            targetEvent: $event,
            clickOutsideToClose: false,
            locals: {
                contactPerson: person,
                legalEntityController: this
            }
        })
    }
    
    saveContactPerson(person, isAddMode){
        // save the person to the selected legal entity.
        if(isAddMode === true){
            // this is a new person
            this.selected.CONTACT_PERSON.push(person);
        } 
        // save the new or modified contact person by updating the legal entity            
        this.legalEntityService.updateLegalEntity(this.selected);
    }
        
    // test/debug functions
    viewLegalEntityJson($event) {
        let self = this;
        if (this.selected != null && this.selected._id != null) {
            let leJson = JSON.stringify(this.selected);            
            self.$mdDialog.show(
                    self.$mdDialog
                        .alert()
                        .clickOutsideToClose(true)
                        .title('Legal Entity JSON')
                        .content(leJson)
                        .ok('Ok')
                        .targetEvent($event)
            );
        }
    }
    
    viewLegalEntityGHSTS($event) {
        let self = this;
        if (this.selected != null && this.selected._id != null) {   
            this.legalEntityService.getLegalEntityGHSTSById(this.selected._id).then(xml =>              
                self.$mdDialog.show(
                        self.$mdDialog
                            .alert()
                            .clickOutsideToClose(true)
                            .title('Legal Entity GHSTS')
                            .content(xml)
                            .ok('Ok')
                            .targetEvent($event)
                    )
            );
        };
    }
    
    initializeLE(){
        // read from sample ghsts and populate the database with legal entities.       
        this.legalEntityService.initializeLE();
    }
    
    addTestLE(){
        // read from sample ghsts and populate the database with legal entities.       
        this.legalEntityService.addLegalEntityToDB();
    }
}

LegalEntityController.$inject = ['$mdDialog', '$mdSidenav', '$location', 'legalEntityService', 'pickListService'];

export { LegalEntityController }

