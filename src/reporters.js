// noinspection Eslint
'use strict';

const c = require('chalk');
const gulpUtil = require('gulp-util');
const map = require('map-stream');

// Consts
const PLUGIN_NAME = 'gulp-isort';

const fancyReporter = (result) => {
  const cwd = process.cwd();
  let filenamePrevious = '';
  let filenamePrint = '';
  let filenameLength = 0;
  result.isort.errorList.forEach((error) => {
    if (filenamePrevious !== error.filename) {
      filenamePrevious = error.filename;
      filenamePrint = filenamePrevious.replace(`${cwd}/`, '');
      filenameLength = filenamePrint.length;
    } else {
      filenamePrint = new Array(filenameLength + 1).join(' ');
    }
    const msg = `${c.cyan(filenamePrint)} ` +
                `${c.red(error.reason)}`;
    gulpUtil.log(msg);
  });
};

const defaultReporter = (result) => {
  const cwd = process.cwd();
  result.isort.errorList.forEach((error) => {
    const filenamePrint = error.filename.replace(`${cwd}/`, '');

    const msg = `${filenamePrint} ${error.reason}`;
    gulpUtil.log(msg);
  });
};

const verboseReporter = (result) => {
  const cwd = process.cwd();
  result.isort.errorList.forEach((error) => {
    const filenamePrint = error.filename.replace(`${cwd}/`, '');

    const msg = `${filenamePrint} ${error.reason}`;
    gulpUtil.log(msg);
  });

  result.isort.infoList.forEach((info) => {
    const filenamePrint = info.filename.replace(`${cwd}/`, '');

    const msg = `${filenamePrint} ${info.reason}`;
    gulpUtil.log(msg);
  });
};

/**
 * Maps isort result objects through the given reporter if success is false.
 * @param reporter A reporter function that takes a file and reports
 *    on the isort object.
 *    Optional, defaults to defaultReporter.
 */
exports.reporter = (paramReporter) => {
  let reportFormat = paramReporter;
  switch (reportFormat) {
    case 'fancy':
      reportFormat = fancyReporter;
      break;
    case 'verbose':
      reportFormat = verboseReporter;
      break;
    default:
      reportFormat = defaultReporter;
  }

  return map((result, cb) => {
    // Only report if isort was run and errors were found
    let error;
    if (result.isort) {
      error = reportFormat(result);
    }

    return cb(error, result);
  });
};
