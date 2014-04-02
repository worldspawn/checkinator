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