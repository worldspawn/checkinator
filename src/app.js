(function(){
    'use strict';

    angular.module('checkinator', [
        'app.security'
        ]).run(['authentication', function (Authentication) {
            var authenticationService = new Authentication();
        }]);

    angular.bootstrap(document, ['checkinator']);        
})();