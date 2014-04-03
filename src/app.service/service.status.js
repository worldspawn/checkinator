(function() {
    'use strict';

    angular.module('app.service.status', ['firebase', 'app.service.firebase'])
        .factory('statusService', ['$firebase', 'firebaseRef', '$rootScope', '$timeout', '$q', function($firebase, firebaseRef, $rootScope, $timeout, $q){
            function UserStatus() {
                this.status = 'In Office';
                this.departed = null;
                this.returned = null;
                this.returning = null;
                this.location = 'Kiandra Melbourne';
            }

            function StatusService() {
                $rootScope.$on('$firebaseSimpleLogin:login', angular.bind(this, function(event, user){
                    this.key = user.email.replace(/\./g, '_');
                    this.statusRef = firebaseRef('currentstatus');
                    this.statusHistoryRef = firebaseRef('statushistory/' + this.key);
                    this.status = $firebase(this.statusRef);
                    this.userprofileRef = firebaseRef('users/' + this.key);
                    this.userprofileRef.on('value', angular.bind(this, function(snap) {
                            if (snap.val() === null){
                                //user has no profile!
                                this.addProfile(user).then(angular.bind(this, function(profile){
                                    //profile is now saved
                                    this.userprofile = profile;
                                    this.setStatus(new UserStatus());
                                }));
                            }
                            else{
                                this.userprofile = snap.val();
                                $rootScope.$broadcast('StatusService:profileupdated', this.userprofile);
                            }
                        }));

                    $rootScope.$broadcast('StatusService:statusloaded', this.status);
                }));

                $rootScope.$on('$firebaseSimpleLogin:logout', angular.bind(this, function(event){
                    this.key = null;
                    this.statusRef = null;
                    this.status = null;
                    this.userprofileRef = null;
                    this.userprofile = null;
                    $rootScope.$broadcast('StatusService:statusunloaded');
                }));
            }

            StatusService.prototype = {
                updateProfile: function(update){
                    this.userprofileRef.update(update);
                },
                setStatus: function(newStatus){
                    var defer = $q.defer();
                    var currentStatus = this.status[this.key];

                    newStatus.datecreated = new Date().toISOString();

                    this.statusRef.child(this.key).set(
                        angular.extend({}, 
                            { email: this.userprofile.email, displayName : this.userprofile.displayName, picture: this.userprofile.picture },
                            { status : newStatus }),
                        angular.bind(this, function (error){
                            if (error){
                                defer.reject(error);
                            }
                            else{
                                if (currentStatus){
                                    var history = this.statusHistoryRef.push();
                                    var oldStatus = currentStatus.status;
                                    history.set(oldStatus, function(error){
                                        if (error){
                                            defer.reject(error);
                                        }
                                        else{
                                            defer.resolve();
                                        }
                                    });
                                    
                                }
                                else{
                                    defer.resolve();
                                }
                            }
                        }));

                    return defer.promise;

                },
                addProfile: function(user){
                    var defer = $q.defer();
                    var profile = {
                        email: user.email,
                        displayName: user.displayName,
                        picture: user.picture
                    };

                    this.userprofileRef.set(profile, function(error){
                        if (error){
                            defer.reject(error);
                        }
                        else{
                            defer.resolve(profile);
                        }
                    });

                    return defer.promise;
                }
            };

            return new StatusService();
        }]);
})();