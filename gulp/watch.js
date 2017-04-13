'use strict';

var path = require('path');
var gulp = require('gulp');
var conf = require('./conf');

var browserSync = require('browser-sync');
//
//function isOnlyChange(event) {
//  return event.type === 'changed';
//}
//
//gulp.task('watch', ['inject'], function () {
//
//  gulp.watch([path.join(conf.paths.src, '/*.html'), 'bower.json'], ['inject-reload']);
//
//  gulp.watch([
//    path.join(conf.paths.src, '/sass/**/*.css'),
//    path.join(conf.paths.src, '/sass/**/*.scss')
//  ], function(event) {
//    if(isOnlyChange(event)) {
//      gulp.start('styles-reload');
//    } else {
//      gulp.start('inject-reload');
//    }
//  });
//
//  gulp.watch(path.join(conf.paths.src, '/app/**/*.js'), function(event) {
//    if(isOnlyChange(event)) {
//      gulp.start('scripts-reload');
//    } else {
//      gulp.start('inject-reload');
//    }
//  });
//
//  gulp.watch(path.join(conf.paths.src, '/app/**/*.html'), function(event) {
//    browserSync.reload(event.path);
//  });
//});
function isOnlyChange(event) {
    return event.type === 'changed';
}

gulp.task('watch', ['inject'], function () {

    gulp.watch(['src/*.html', 'bower.json'], ['inject-reload']);

    gulp.watch([
        'src/sass/**/*.css',
        'src/sass/**/*.scss'
    ], function (event) {
        console.log('watch one');
        if (isOnlyChange(event)) {
            gulp.start('styles-reload');
        } else {
            gulp.start('inject-reload');
        }
    });

    gulp.watch('src/app/**/*.js', function (event) {
        console.log('watch two');
        if (isOnlyChange(event)) {
            gulp.start('scripts-reload');
        } else {
            gulp.start('inject-reload');
        }
    });

    gulp.watch('src/app/**/*.html', function (event) {
        console.log('watch three');
        browserSync.reload(event.path);
    });
});
