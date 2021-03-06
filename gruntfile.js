module.exports = function(grunt) {
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
          console: true
        }
      }
    },
    karma: {
      app: {
        options: {
          configFile: './configs/karma.conf.js'
        }
      }
    },
    html2js: {
      options: {
        useStrict: true,
        module: 'app.templates'
      },
      default: {
        src: ['src/views/partials/*.html'],
        dest: 'src/app.templates/app.templates.js',
      }
    },
    less: {
      dev: {
        options: {
          compress: true,
          sourceMap: true,
          sourceMapFilename: 'public/app/css/style.css.map',
          soureMapURL: 'public/app/css/style.css.map',
          outputSourceFiles: true
        },
        files: {
          "public/app/css/style.css" : "src/less/main.less"
        }

      }
    },
    watch: {
      scripts: {
        tasks: ['concat', 'jshint'],
        files: ['src/app.*/*.js', 'src/app.js']
      },
      less: {
        tasks: ['less'],
        files: ['src/less/**/*']
      },
      templates: {
        tasks: ['html2js'],
        files: ['src/views/partials/*.html']
      }
    },
  });

  grunt.file.copy('./src/views/index.html', './public/index.html');

  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-karma');
  grunt.loadNpmTasks('grunt-karma-coveralls');
  grunt.loadNpmTasks('grunt-html2js');

  grunt.registerTask('default', ['html2js', 'less', 'concat', 'jshint']);
}