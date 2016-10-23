var gutil = require('gulp-util');
var through = require('through2');

module.exports = function(opts) {
  opts = opts || {};

  return through.obj(function(file, enc, cb) {
    if (file.isNull()) {
      cb(null, file);
      return;
    }

    if (file.isStream()) {
      cb(new gutil.PluginError('gulp-thisful-construct', 'Streaming not supported'));
      return;
    }

    try {
      var content = file.contents.toString();
      content = content.replace(/constructor\(([^\)]+)\) \{/ig, function(ori, args) {
        args = args
          .replace(/\s/ig, '')
          .split(',')
          .map(arg => 'this.' + arg.replace(/\$/, '') + '=' + arg + ';')
          .join('');
        return ori + args;
      });
      file.contents = new Buffer(content);
      this.push(file);
    } catch (err) {
      this.emit('error', new gutil.PluginError('gulp-thisful-construct', err, {
        fileName: file.path,
        showProperties: false
      }));
    }

    cb();
    return;
  });
};
