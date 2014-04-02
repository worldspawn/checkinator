(function(){
    'use strict';

    angular.module('checkinator', [
        'app.routes',
        'app.directives',
        'app.services',        
        'app.controllers',
        'app.templates',
        'ui.bootstrap',
        ]).run(['loginService', '$rootScope', function (loginService, $rootScope) {
            $rootScope.auth = loginService.init();
        }]);

    //angular.bootstrap(document, ['checkinator']);        
})();