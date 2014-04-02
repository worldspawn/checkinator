(function() {
    'use strict';

    angular.module('app.directive.login', ['app.service.login'])
        .directive('login', ['loginService', '$rootScope', 
            function(loginService, $rootScope){
                return {
                    restrict: 'E',
                    replace: true,
                    templateUrl: 'views/partials/login.html',
                    controller : function($scope) {
                        $scope.loginGoogle = function() {
                            loginService.google(function(error, user){
                                if (user){
                                    $rootScope.loggedOn = true;
                                    $rootScope.$broadcast('identityEstablished', user);
                                }
                            });
                        };

                        loginService.getCurrentUser().then(function(user){
                            if (user){
                                $rootScope.loggedOn = true;
                            }   
                        });
                    }
                };
            }]);
})();