(function() {
    'use strict';

    angular.module('app.service.firebase', ['firebase'])
        .factory('firebaseRef', ['Firebase', 'fburl', 
            function(Firebase, fburl) {
                return function(path) {
                    return new Firebase(pathRef([fburl].concat(Array.prototype.slice.call(arguments))));
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
        ])
        .value('fburl', 'https://checkinator.firebaseio.com/');

    function pathRef(args) {
        for (var i = 0; i < args.length; i++) {
            if (typeof(args[i]) === 'object') {
                args[i] = pathRef(args[i]);
            }
        }
        return args.join('/');
    }
})();