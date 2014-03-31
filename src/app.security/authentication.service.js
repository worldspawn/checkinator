(function(){
    'use strict';

    angular.module('app.security')
        .factory('authentication', ['$firebase', function($firebase){
            var ref = new Firebase("https://checkinator.firebaseio.com/");

            function AuthenticationService(){
                this.auth = new FirebaseSimpleLogin(ref, angular.bind(this, function(error, user){
                    this.user = user;
                    console.log(this.user, error);

                    if (this.user){
                        this.syncAccount();
                    }
                    else{
                        this.login();
                    }
                }));
            }

            AuthenticationService.prototype = {
                logout: function() {
                    this.auth.logout();
                },
                login: function() {
                    this.auth.login('google', { debug: true });
                },
                syncAccount: function() {
                    var users = ref.child('user');
console.log(this.user.email);
                    users
                        .startAt(this.user.email)
                        .endAt(this.user.email)
                        .once('value', angular.bind(this, function(snap){
                            var userAccount = snap.val();
                            console.log(userAccount, userAccount.email);
                            if (!userAccount){
                                var newRef = users.push();
                                newRef.setWithPriority(
                                    {
                                        displayName: this.user.displayName,
                                        email: this.user.email,
                                        familyName: this.user.family_name,
                                        givenName: this.user.given_name,
                                        picture: this.user.picture
                                    }, this.user.email);
                            }
                        }));
                    
                }
            };

            return AuthenticationService;
        }]);
})();