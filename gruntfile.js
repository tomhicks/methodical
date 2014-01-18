'use strict';

module.exports = function(grunt) {

  // Add the grunt-mocha-test tasks.
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-mocha-test');

  grunt.initConfig({
    // Configure a mochaTest task
    mochaTest: {
      test: {
        options: {
          reporter: 'spec'
        },
        src: ['test/**/*.js']
      }
    },
    watch: {
      scripts: {
        files: ['test/**/*.js', 'src/**/*.js'],
        tasks: ['test']
      },
    },
  });

  grunt.registerTask('test', 'mochaTest:test');
  grunt.registerTask('test-watch', ['test', 'watch']);

};