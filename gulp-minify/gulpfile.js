const {
    src,
    dest,
    watch
} = require('gulp');
const cache = require('gulp-cached')

function copyAllFiles() {
    return src(['../../bradquirk.github.io_master/_site/**/*'])
        .pipe(cache('copy'))
        .pipe(dest('../'));
}

function watchTask() {
    watch('../../bradquirk.github.io_master/_site/**/*', copyAllFiles)
}

exports.default = watchTask