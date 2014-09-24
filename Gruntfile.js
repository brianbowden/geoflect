var pkg = require('./package.json');

module.exports = function (grunt) {
  grunt.initConfig({
    shipit: {
      options: {
        workspace: '/tmp/geoflect-workspace',
        deployTo: '/usr/src/geoflect',
        repositoryUrl: pkg.repository.url,
        ignores: ['.git', 'node_modules'],
        keepReleases: 3
      },
      production: {
        servers: ['geoflect@geoflect.com']
      }
    }
  });

  grunt.loadNpmTasks('grunt-shipit');
};