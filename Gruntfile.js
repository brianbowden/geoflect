var pkg = require('./package.json');

module.exports = function (grunt) {
  grunt.initConfig({
    shipit: {
      options: {
        workspace: '/tmp/geoflect-workspace',
        deployTo: '/home/geoflect/production',
        repositoryUrl: pkg.repository.url,
        ignores: ['.git', 'node_modules'],
        keepReleases: 3
      },
      production: {
        servers: ['geoflect.com']
      }
    }
  });

  grunt.loadNpmTasks('grunt-shipit');
};