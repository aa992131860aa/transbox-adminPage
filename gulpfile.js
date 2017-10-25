'use strict';

var gulp = require('gulp');
var wrench = require('wrench');
var browserSync = require('browser-sync');

/**
 *  This will load all js or coffee files in the gulp directory
 *  in order to load all gulp tasks
 */
wrench.readdirSyncRecursive('./gulp').filter(function(file) {
    return (/\.(js|coffee)$/i).test(file);
}).map(function(file) {
    require('./gulp/' + file);
    console.log('gggg:'+'./gulp/' + file);
});


/**
 *  Default task clean temporaries directories and launch the
 *  main optimization build task
 */
gulp.task('default', ['clean'], function () {
    gulp.start('build');
    // console.log('111start watch?111');
    //gulp.start('serve');
});





