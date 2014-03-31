module.exports = function (grunt) {
  grunt.initConfig({
    concat: {
      dist: {
        src: ['src/app.*/*.js', 'src/app.js'],
        dest: 'public/app/app.js'
      }
    },
    jshint: {
      beforeconcat: ['src/app.*/*.js', 'src/app.js'],
      afterconcat: ['public/app/app.js'],
      options: {
        curly: true,
        eqeqeq: true,
        immed: true,
        latedef: true,
        newcap: true,
        noarg: true,
        sub: true,
        undef: true,
        boss: true,
        eqnull: true,
        globals: {
          angular: true,
          Firebase: true,
          FirebaseSimpleLogin: true,
          console: true,
          document: true
        }
      }
    },
    karma: {
      app : {
        options: { configFile: './configs/karma.conf.js' }
      }      
    }
  });

  grunt.file.copy('./src/views/index.html', './public/index.html');

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-karma');
  grunt.loadNpmTasks('grunt-karma-coveralls');

  grunt.registerTask('default', ['concat', 'jshint']);
}