(function(){
    'use strict';

    angular.module('app.controller.status', ['app.service.status'])
        .controller('StatusController', ['$scope', 'statusService', function($scope, StatusService){
            var statusService = new StatusService();

            $scope.$watch(function() { return statusService.status; }, function(val){
                $scope.statusList = val;
            });            
        }]);
})();