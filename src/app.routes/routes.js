(function(){
    'use strict';

    angular.module('app.routes', ['ngRoute'])
        .config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider){
            $locationProvider.html5Mode(true);

            $routeProvider.when('/', {
                templateUrl: 'views/partials/status.html',
                controller: 'StatusController'
            });
        }]);
})();