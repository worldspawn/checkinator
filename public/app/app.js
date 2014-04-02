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
(function(){
    'use strict';

    angular.module('app.controllers', ['app.controller.status', 'app.controller.statusupdate']);
})();
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
(function(){
    'use strict';

    angular.module('app.directives', ['app.directive.login']);
})();
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
(function() {
    'use strict';

    angular.module('app.service.firebase', ['firebase'])
        .factory('firebaseRef', ['Firebase',
            function(Firebase) {
                return function(path) {
                    return new Firebase(pathRef(['https://checkinator.firebaseio.com/'].concat(Array.prototype.slice.call(arguments))));
                };
            }
        ])
        .service('syncData', ['$firebase', 'firebaseRef',
            function($firebase, firebaseRef) {
                /**
                 * @function
                 * @name syncData
                 * @param {String|Array...} path
                 * @param {int} [limit]
                 * @return a Firebase instance
                 */
                return function(path, limit) {
                    var ref = firebaseRef(path);
                    if (limit){
                        ref = ref.limit(limit);
                    }
                    return $firebase(ref);
                };
            }
        ]);

    function pathRef(args) {
        for (var i = 0; i < args.length; i++) {
            if (typeof(args[i]) === 'object') {
                args[i] = pathRef(args[i]);
            }
        }
        return args.join('/');
    }
})();
angular.module('app.service.login', ['firebase', 'app.service.firebase'])

.factory('loginService', ['$rootScope', '$firebaseSimpleLogin', 'firebaseRef', 'profileCreator', '$timeout',
   function($rootScope, $firebaseSimpleLogin, firebaseRef, profileCreator, $timeout) {
      var auth = null;
      function assertAuth() {
         if (auth === null) {
            throw new Error('Must call loginService.init() before using its methods');
         }
      }

      return {
         init: function() {
            return auth = $firebaseSimpleLogin(firebaseRef());
         },

         google: function(callback){
            assertAuth();
            auth.$login('google').then(function(user){
               if (callback){
                  callback(null, user);
               }
            }, callback);
         },

         getCurrentUser: function(){
            return auth.$getCurrentUser();
         },

         /**
          * @param {string} email
          * @param {string} pass
          * @param {Function} [callback]
          * @returns {*}
          */
         login: function(email, pass, callback) {
            assertAuth();
            auth.$login('password', {
               email: email,
               password: pass,
               rememberMe: true
            }).then(function(user) {
               if (callback) {
                  callback(null, user);
               }
            }, callback);
         },

         logout: function() {
            assertAuth();
            auth.$logout();
         },

         changePassword: function(opts) {
            assertAuth();
            var cb = opts.callback || function() {};
            if (!opts.oldpass || !opts.newpass) {
               $timeout(function() {
                  cb('Please enter a password');
               });
            } else if (opts.newpass !== opts.confirm) {
               $timeout(function() {
                  cb('Passwords do not match');
               });
            } else {
               auth.$changePassword(opts.email, opts.oldpass, opts.newpass).then(function() {
                  if (cb) {
                     cb(null);
                  }
               }, cb);
            }
         },

         createAccount: function(email, pass, callback) {
            assertAuth();
            auth.$createUser(email, pass).then(function(user) {
               if (callback) {
                  callback(null, user);
               }
            }, callback);
         },

         createProfile: profileCreator
      };
   }
])

.factory('profileCreator', ['firebaseRef', '$timeout',
   function(firebaseRef, $timeout) {
      return function(id, email, callback) {
         function firstPartOfEmail(email) {
            return ucfirst(email.substr(0, email.indexOf('@')) || '');
         }

         function ucfirst(str) {
            // credits: http://kevin.vanzonneveld.net
            str += '';
            var f = str.charAt(0).toUpperCase();
            return f + str.substr(1);
         }

         firebaseRef('users/' + id).set({
            email: email,
            name: firstPartOfEmail(email)
         }, function(err) {
            //err && console.error(err);
            if (callback) {
               $timeout(function() {
                  callback(err);
               });
            }
         });
      };
   }
]);
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
(function(){
    'use strict';

    angular.module('app.services', ['app.service.login', 'app.service.firebase', 'app.service.status']);
})();
angular.module('app.templates', ['views/partials/login.html', 'views/partials/status.html']);

angular.module("views/partials/login.html", []).run(["$templateCache", function($templateCache) {
  "use strict";
  $templateCache.put("views/partials/login.html",
    "<div ng-if=\"loggedOn !== true\">\n" +
    "	<p>LOGIN</p>\n" +
    "	<button type=\"button\" ng-click=\"loginGoogle()\">GOOGLE</button>\n" +
    "</div>");
}]);

angular.module("views/partials/status.html", []).run(["$templateCache", function($templateCache) {
  "use strict";
  $templateCache.put("views/partials/status.html",
    "<div class=\"container\">\n" +
    "<h1>Status</h1>\n" +
    "\n" +
    "<div class=\"row\">\n" +
    "<div class=\"col-md-8\">\n" +
    "	<table class=\"table\">\n" +
    "		<tbody>\n" +
    "		<tr ng-repeat=\"status in statusList\">\n" +
    "			<td><img ng-src=\"{{status.picture}}\" width=\"80\" /></td>\n" +
    "			<td>{{status.displayName}}</td>\n" +
    "			<td>{{status.status.status}} @ {{status.status.location}} till {{status.status.returning}}</td>\n" +
    "		</tr>\n" +
    "		</tbody>\n" +
    "	</table>\n" +
    "</div>\n" +
    "\n" +
    "<div class=\"col-md-4\">\n" +
    "	<form ng-if=\"loggedOn === true\" name=\"statusUpdate\" ng-controller=\"StatusUpdateController\" ng-submit=\"commitStatus()\" role=\"form\">\n" +
    "		<fieldset>\n" +
    "			<div class=\"form-group\">\n" +
    "				<label>Location</label>\n" +
    "				<input type=\"text\" ng-model=\"update.location\" typeahead=\"location for location in locations\" class=\"form-control\">\n" +
    "			</div>\n" +
    "			<div class=\"form-group\">\n" +
    "				<label>Status</label>\n" +
    "				<input type=\"text\" ng-model=\"update.status\" typeahead=\"activity for activity in activities\" class=\"form-control\">\n" +
    "			</div>\n" +
    "			<div class=\"form-group\">\n" +
    "				<label>Returning</label>\n" +
    "				<p class=\"input-group\">\n" +
    "					<input type=\"text\" class=\"form-control\" is-open=\"opened\" datepicker-popup=\"d MMMM yyyy\" ng-model=\"update.returning\" ng-required=\"true\" close-text=\"Close\" />\n" +
    "					<span class=\"input-group-btn\">\n" +
    "						<button type=\"button\" class=\"btn btn-default\" ng-click=\"open($event)\"><i class=\"glyphicon glyphicon-calendar\"></i></button>\n" +
    "					</span>\n" +
    "				</p>\n" +
    "				<div>\n" +
    "					<button type=\"button\" class=\"btn btn-danger\" ng-click=\"addMinutes(15)\">15m</button>\n" +
    "					<button type=\"button\" class=\"btn btn-danger\" ng-click=\"addMinutes(30)\">30m</button>\n" +
    "					<button type=\"button\" class=\"btn btn-danger\" ng-click=\"addMinutes(60)\">1 hr</button>\n" +
    "					<button type=\"button\" class=\"btn btn-danger\" ng-click=\"setTomorrow()\">Tomorrow</button>\n" +
    "					<button type=\"button\" class=\"btn btn-danger\" ng-click=\"addMinutes(10080)\">1 Week</button>\n" +
    "				</div>\n" +
    "				<div ng-model=\"update.returning\" style=\"display:inline-block;\">\n" +
    "					<timepicker hour-step=\"1\" minute-step=\"15\" show-meridian=\"false\"></timepicker>\n" +
    "				</div>				\n" +
    "			</div>\n" +
    "		</fieldset>\n" +
    "		<fieldset>\n" +
    "			<button type=\"submit\" class=\"btn btn-primary\" ng-disabled=\"statusUpdate.$invalid\">Update</button>\n" +
    "		</fieldset>\n" +
    "	</form>\n" +
    "</div>\n" +
    "</div>\n" +
    "</div>");
}]);

(function(){
    'use strict';

    angular.module('checkinator', [
        'app.routes',
        'app.directives',
        'app.services',        
        'app.controllers',
        'app.templates',
        'ui.bootstrap',
        ]).run(['loginService', '$rootScope', function (loginService, $rootScope) {
            $rootScope.auth = loginService.init();
        }]);

    //angular.bootstrap(document, ['checkinator']);        
})();