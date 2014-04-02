(function(){ 
    'use strict';

    angular.module('app.controller.statusupdate', ['app.service.status'])
        .controller('StatusUpdateController', ['$scope', 'statusService', 'loginService', '$firebase', 'firebaseRef',
            function($scope, StatusService, loginService, $firebase, firebaseRef){
            var statusService = new StatusService();

            var locations = $firebase(firebaseRef('locations'));
            locations.$on('value', function(data){
                $scope.locations = [];
                angular.forEach(data.snapshot.value, function(x){
                    $scope.locations.push(x);
                });
            });

            var activities = $firebase(firebaseRef('activities'));
            activities.$on('value', function(data){
                $scope.activities = [];
                angular.forEach(data.snapshot.value, function(x){
                    $scope.activities.push(x);
                });
            });

            function StatusUpdate(){
                this.location = null;
                this.status = null;

                var currentTime = new Date();
                var minutes = currentTime.getMinutes();
                minutes = minutes - (minutes % 15) + 15;
                currentTime.setMinutes(minutes);

                this.returning = currentTime;
            }

            function commitStatus(){                
                var update = $scope.update;

                loginService.getCurrentUser().then(function(user){
                    update.returning = update.returning.toISOString();
                    statusService.setStatus(user, update);

                    $scope.update = new StatusUpdate();
                });                
            }

            $scope.update = new StatusUpdate();
            $scope.commitStatus = commitStatus;

            $scope.addMinutes = function(minutes) {
                var selectedTime = $scope.update.returning;
                selectedTime.setMinutes(selectedTime.getMinutes() + minutes);
                $scope.update.returning = new Date(selectedTime);
            };

            $scope.setTomorrow = function() {
                var selectedTime = $scope.update.returning;
                selectedTime.setDate(selectedTime.getDate()+1);
                selectedTime.setHours(9);
                selectedTime.setMinutes(0);
                $scope.update.returning = new Date(selectedTime);
            };

            $scope.open = function($event) {
                $event.preventDefault();
                $event.stopPropagation();

                $scope.opened = true;
            };
        }]);
})();