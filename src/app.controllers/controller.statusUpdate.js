(function(){ 
    'use strict';

    angular.module('app.controller.statusupdate', ['app.service.status'])
        .controller('StatusUpdateController', ['$scope', 'statusService', 'loginService', '$firebase', 'firebaseRef', function($scope, statusService, loginService, $firebase, firebaseRef){
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

            var defaultStatus = null;
            var defaultLocation = null;

            $scope.$on('StatusService:profileupdated', function(event, profile){
                defaultStatus = profile.lastStatus;
                defaultLocation = profile.lastLocation;

                $scope.update = new StatusUpdate();
            });

            function StatusUpdate(){
                this.location = defaultLocation;
                this.status = defaultStatus;

                var currentTime = new Date();
                var minutes = currentTime.getMinutes();
                minutes = minutes - (minutes % 15) + 15;
                currentTime.setMinutes(minutes);

                this.returning = currentTime;
            }

            function checkin(){
                var status = new StatusUpdate();
                status.location = 'Melbourne Office';
                status.status = 'At Work';

                statusService.setStatus(status)                ;
                statusService.updateProfile({
                    lastStatus: status.status,
                    lastLocation: status.location
                });
            }

            function commitStatus(){
                var update = $scope.update;

                update.returning = update.returning.toISOString();
                statusService.setStatus(update);

                statusService.updateProfile({
                    lastStatus: update.status,
                    lastLocation: update.location
                });
            }

            $scope.commitStatus = commitStatus;
            $scope.checkin = checkin;

            $scope.isCheckedIn = function(){
                return statusService.status && statusService.status[statusService.key] && !statusService.status[statusService.key].status.returning;
            };

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