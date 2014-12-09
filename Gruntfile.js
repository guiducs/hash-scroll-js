module.exports = function(grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        jshint: {
            // define the files to lint
            files: ['Gruntfile.js', '*.js'],
            // configure JSHint (documented at http://www.jshint.com/docs/)
            options: {
                // more options here if you want to override JSHint defaults
                globals: {
                    jQuery: true,
                    console: true,
                    module: true
                }
            }
        },
        concat: {
            js: {
                options:{
                    separator: ';'
                },
                src: ['jquery-hash-scroll.js'],
                dest: '<%= pkg.name %>.min.js'
            }
        },
        uglify: {
            options: {
                mangle: false
            },
            dist: {
                files: {
                    '<%= pkg.name %>.min.js': ['<%= concat.js.dest %>']
                }
            }
        },
    });

    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

    grunt.registerTask('default', [
        'concat',
        'uglify',
    ]);

};
