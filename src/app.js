(function(){
    'use strict';

    angular.module('checkinator', [
        'app.services'
        ]).run(['loginService', '$rootScope', function (loginService, $rootScope) {
            $rootScope.auth = loginService.init('/login');
        }]);

    //angular.bootstrap(document, ['checkinator']);        
})();