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
                            loginService.google();
                        };

                        $scope.loginTwitter = function() {
                            loginService.twitter();
                        };

                        $scope.logout = function() {
                            loginService.logout();
                        };

                        $scope.isLoggedOn = function(){
                            return loginService.user() !== null;
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