'use strict';

describe('authentication.service', function(){
    beforeEach(module('app.security'));

    var authenticationService;

    beforeEach(inject(function(authentication){
        authenticationService = new authentication();
    }));

    it('should give me a service', function(){
        authenticationService.login();
        expect(authenticationService).not.toBe(null);
    });
});