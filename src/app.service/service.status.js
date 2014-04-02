(function() {
    'use strict';

    angular.module('app.service.status', ['firebase', 'app.service.firebase'])
        .factory('statusService', ['$firebase', 'firebaseRef', '$rootScope', '$timeout', function($firebase, firebaseRef, $rootScope, $timeout){
            function UserStatus() {
                this.status = 'In Office';
                this.departed = null;
                this.returned = null;
                this.returning = null;
                this.location = 'Kiandra Melbourne';
            }

            function StatusService() {
                this.status = $firebase(firebaseRef('status'));

                $rootScope.$on('identityEstablished',  angular.bind(this, function(ev, data){
                    this.status = $firebase(firebaseRef('status'));
                    this.getStatusForUser(data, true);
                }));
            }

            StatusService.prototype = {
                getStatusForUser: function(user, create, callback) {
                    var email = user.email.replace(/\./g, '_');

                    firebaseRef('/status/' + email)
                        .once('value', angular.bind(this, function(snap){
                            var val = snap.val();

                            if (create && val === null){
                                this.addUser(user, callback);
                            }
                            else{
                                callback(null, val);
                            }
                        }));
                },
                setStatus: function(user, newStatus){
                    var email = user.email.replace(/\./g, '_');
                    firebaseRef('status/' + email + '/statushistory').push(newStatus);
                    firebaseRef('status/' + email + '/status').set(newStatus);
                },
                addUser: function(user, callback){
                    var email = user.email.replace(/\./g, '_');
                    var userObj = {
                        displayName: user.displayName,
                        email: user.email,
                        picture: user.picture
                    };
                    
                    firebaseRef('/status/' + email).setWithPriority(userObj, user.email, function(err){
                        if (callback) {
                            if (!err){
                                var s = firebaseRef('status/' + email + '/statushistory').push();
                                var ns = new UserStatus();
                                ns.departed = new Date();
                                s.set(ns);
                                firebaseRef('status/' + email + '/status').set(ns);
                            }
                            $timeout(function() {
                                callback(err, userObj);
                            });
                        }
                    });
                }
            };

            return StatusService;
        }]);
})();