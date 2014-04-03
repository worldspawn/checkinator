(function(){
    'use strict';

    angular.module('app.controller.status', ['app.service.status'])
        .controller('StatusController', ['$scope', 'statusService', function($scope, statusService){
            $scope.$on('StatusService:statusloaded', function(event, statusList){
                $scope.statusList = statusList;
            });

            $scope.$on('StatusService:statusunloaded', function(event){
                $scope.statusList = null;
            });
        }]);
})();