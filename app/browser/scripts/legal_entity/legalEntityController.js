import angular from 'angular';

class LegalEntityController {
    constructor($mdDialog, LegalEntityService) {
        this.legalEntityService = LegalEntityService;
        this.$mdDialog = $mdDialog;        
        this.selected = null;
        this.legalEntities = [];
        this.selectedIndex = 0;
        this.filterText = null;
                
        // Load initial data
        this.getAllLegalEntities();
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
            this.legalEntityService.createLegalEntity(this.selected).then(affectedRows => 
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
    
    createLegalEntity() {
        this.selected = {};
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

LegalEntityController.$inject = ['$mdDialog', 'legalEntityService'];

export { LegalEntityController }

