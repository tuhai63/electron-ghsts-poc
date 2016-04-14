import angular from 'angular';

class GhstsController {
    constructor($mdDialog, GhstsService) {
        this.ghstsService = GhstsService;
        this.$mdDialog = $mdDialog;     
    }      
    
    assembleGHSTS($event) {
        // call service to assemble Demo GHSTS and report result
        this.ghstsService.assembleDemoGHSTS();
        this.$mdDialog.show(
            this.$mdDialog
                .alert()
                .clickOutsideToClose(true)
                .title('Success')
                .content('DemoGHSTS.xml Written Successfully!')
                .ok('Ok')
                .targetEvent($event)
        );
    }
}

GhstsController.$inject = ['$mdDialog', 'ghstsService'];

export { GhstsController }

