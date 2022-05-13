const {
    src,
    dest,
    watch
} = require('gulp');

function copyAllFiles() {
    return src(['../../bradquirk.github.io_master/_site/**/*'])
        .pipe(dest('../'));
}

function watchTask() {
    watch('../../bradquirk.github.io_master/_site/**/*', copyAllFiles)
}

exports.default = watchTask