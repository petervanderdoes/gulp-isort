// noinspection Eslint

const gulpUtil = require('gulp-util');
const through = require('through2');
const spawn = require('child_process').spawn;
const eventStream = require('event-stream');
const reporters = require('./reporters');

const PLUGIN_NAME = 'gulp-isort';

const COMMAND_NOT_FOUND = 127;

const formatOutput = (result) => {
  const isortOutput = result.toString().split('\n');
  if (!isortOutput || !isortOutput.length) {
    return {
      success: true,
    };
  }
  const allErrors = [];
  const allInfo = [];
  // ERROR: <filename> Imports are incorrectly sorted.
  // <filename>: Everything Looks Good!
  // <filename>: was skipped as it's listed in 'skip' setting or
  //             matches a glob in 'skip_glob' setting
  // Skipped 64 files
  isortOutput.forEach((line) => {
    if (line.length !== 0) {
      const firstSpace = line.indexOf(' ');
      const secondSpace = line.indexOf(' ', firstSpace + 1);
      const detailObject = {};
      const firstWord = line.slice(0, firstSpace);
      switch (firstWord) {
        case 'ERROR:':
          detailObject.filename = line.slice(firstSpace, secondSpace).concat(':');
          detailObject.reason = line.slice(secondSpace);
          allErrors.push(detailObject);
          break;
        case 'Skipped':
          detailObject.filename = '';
          detailObject.reason = line;
          allInfo.push(detailObject);
          break;
        case 'SUCCESS:':
          detailObject.filename = line.slice(firstSpace, secondSpace).concat(':');
          detailObject.reason = line.slice(secondSpace);
          allInfo.push(detailObject);
          break;
        case 'WARNING:':
          detailObject.filename = line.slice(firstSpace, secondSpace).concat(':');
          detailObject.reason = line.slice(secondSpace);
          allInfo.push(detailObject);
          break;
        default:
          break;
      }
    }
  });
  return {
    success: allErrors.length === 0,
    errorCount: allErrors.length,
    errorList: allErrors,
    infoList: allInfo,
  };
};

const gulpIsort = (paramOptions) => {
  // Handle when options is a config file path
  let options = paramOptions;
  if (typeof options === 'string') {
    options = { config: options };
  }
  if (!options) options = {};
  let args = [];
  const config = options.config;
  const bin = options.bin || 'isort';

  let stream;
  const files = [];
  let isortOutput = '';

  args = args.concat(bin.split(/\s/));

  args = args.concat(options.args || []);

  if (config) {
    args.push(`--config=${config}`);
  }
  // Flake8 exists with non zero if it finds a lint error.
  // args.push('--exit-zero');
  args.push(('--check-only'));
  args.push(('-vb'));

  /**
   * If code is non-zero and does not represent a lint error,
   * then returns a PluginError.
   */
  function createExecError(code, executable) {
    let msg;
    let pluginError;

    if (code) {
      if (code === 'ENOENT' || COMMAND_NOT_FOUND === code) {
        msg = `${executable} could not be found`;
      } else if (code !== 1) {
        msg = `isort exited with code ${code}`;
      }
    }
    if (msg) {
      pluginError = new gulpUtil.PluginError(PLUGIN_NAME, msg);
    }

    return pluginError;
  }

  function queueFile(file) {
    // Process a file even if file.contents === null (i.e. file.isNull() === true)
    // since we don't actually care about the file contents.
    if (file) {
      // Hang onto files until the end of the stream so that they can be
      // sent in a batch to scss-lint, which significantly increases
      // performance for large numbers of files.
      if (file.path) {
        files.push(file);
      } else {
        stream.emit('error', new gulpUtil.PluginError(PLUGIN_NAME, 'File provided with no path'));
      }
    }
  }

  /**
   * Spawns the isort binary using args with the given filePaths
   * and returns the spawned process.
   */
  function spawnIsort(filePaths) {
    const execOptions = args.concat(filePaths);
    const spawnBin = execOptions.shift();

    // gulpUtil.log(`${bin} ${execOptions.join(' ')}`);

    // Run isort
    return spawn(spawnBin, execOptions, {
      cwd: process.cwd(),
      stdio: ['ignore', 'pipe', process.stderr],
    });
  }

  function endStream() {
    // Don't run isort if there are no files
    if (!files.length) {
      stream.emit('end');
      return;
    }
    const filePaths = files.map(file => file.path);
    filePaths.sort();
    const lint = spawnIsort(filePaths);
    lint.stdout.on('data', (data) => {
      isortOutput += data;
      return isortOutput;
    });

    // Handle spawn errors
    lint.on('error', (error) => {
      const execError = createExecError(error.code, bin);
      stream.emit('error', execError);
    });

    // On exit, handle lint output
    lint.on('exit', (code) => {
      const execError = createExecError(code, bin);
      if (execError) {
        stream.emit('error', execError);
      } else {
        const result = {};
        result.isort = formatOutput(isortOutput);
        stream.emit('data', result);
        stream.emit('end');
      }
      stream.emit('end');
    });
  }

  stream = eventStream.through(queueFile, endStream);
  return stream;
};

gulpIsort.failAfterError = () => through.obj((result, enc, callback) => {
  const count = result.isort.errorCount;
  if (!count) {
    callback(null, result);
    return;
  }
  callback(new gulpUtil.PluginError('gulp-isort',
    {
      name: 'isortError',
      message: `Failed with ${count}${(count === 1 ? ' error' : ' errors')}`,
    }
  ));
});

// Expose the reporters
gulpIsort.reporter = reporters.reporter;

module.exports = gulpIsort;
