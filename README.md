[license]: /LICENSE
[npm-image]: https://img.shields.io/npm/v/@petervanderdoes/gulp-isort.svg?style=flat-square
[npm-url]: https://npmjs.org/package/@petervanderdoes/gulp-isort
[downloads-image]: https://img.shields.io/npm/dm/@petervanderdoes/gulp-isort.svg?style=flat-square
[downloads-url]: https://npmjs.org/package/@petervanderdoes/gulp-isort
[semi-image]: https://img.shields.io/badge/code%20style-strict-brightgreen.svg?style=flat-square
[semi-url]: https://github.com/Flet/semistandard
[license-image]: https://img.shields.io/github/license/petervanderdoes/gulp-isort.svg?style=flat-square
[license-url]: /LICENSE
[dependencies-image]: https://david-dm.org/petervanderdoes/gulp-isort.svg?style=flat-square
[dependencies-url]: https://david-dm.org/petervanderdoes/gulp-isort
[dev-dependencies-image]: https://david-dm.org/petervanderdoes/gulp-isort/dev-status.svg?style=flat-square
[dev-dependencies-url]: https://david-dm.org/petervanderdoes/gulp-isort#info=devDependencies

# Gulp Isort

[![npm][npm-image]][npm-url]
[![downloads][downloads-image]][downloads-url]
[![js-semistandard-style][semi-image]][semi-url]
[![license][license-image]][license-url]
[![dependencies][dependencies-image]][dependencies-url]
[![dev-dependencies][dev-dependencies-image]][dev-dependencies-url]

Gulp task for isort.

## Installation

## Install

    npm install @petervanderdoes/gulp-isort --save-dev

This plugin requires [isort](https://github.com/timothycrosley/isort#installing-isort)
to be installed.

From a terminal:

```sh
python -m pip install isort
```
## Usage

```javascript
var gulp = require('gulp');
var gulpIsort = require('gulp-isort');

gulp.task('isort', function () {
  return gulp.src('**/*')
    .pipe(gulpIsort())
    .pipe(gulpIsort.reporter())
    .pipe(gulpIsort.failAfterError());
});
```

## API

### gulpIsort.reporter(format)

##### format
Type: `String`

The format of the report. The plugin comes with three build-in options:
- default
- fancy
- verbose

Default is `default`

###### default
Only display errors.

Example:
```javascript
stuff
  .pipe(gulpIsort())
  .pipe(gulpIsort.reporter())
```
Example Output:

```
manage.py:  Imports are incorrectly sorted.
wger/exercises/views/categories.py:  Imports are incorrectly sorted.
wger/exercises/views/comments.py:  Imports are incorrectly sorted.
wger/exercises/views/equipment.py:  Imports are incorrectly sorted.

```

###### fancy
A colored output which displays error only. If a file has multiple errors, the filename is only 
displayed on the first error.

Example:
```javascript
stuff
  .pipe(gulpIsort())
  .pipe(gulpIsort.reporter('fancy'))
```
Example output:

```
manage.py:  Imports are incorrectly sorted.
wger/exercises/views/categories.py:  Imports are incorrectly sorted.
wger/exercises/views/comments.py:  Imports are incorrectly sorted.
wger/exercises/views/equipment.py:  Imports are incorrectly sorted.
```

###### verbose
Displays all messages from isort but gulp only stops linting if there are isort errors.

Example:
```javascript
stuff
  .pipe(gulpIsort())
  .pipe(gulpIsort.reporter('verbose'))
```
Example output:

```
manage.py:  Imports are incorrectly sorted.
wger/exercises/views/categories.py:  Imports are incorrectly sorted.
wger/exercises/views/comments.py:  Imports are incorrectly sorted.
wger/exercises/views/equipment.py:  Imports are incorrectly sorted.
```

### gulpIsort.failAfterError()
Stop a task/stream if a ``gulpIsort`` error has been reported for any file.

```javascript
gulp.task('lint-python', function () {
  return gulp.src('**/*py')
    .pipe(gulpIsort())
    .pipe(gulpIsort.failAfterError());
});
```

## Result
Type: ``Object``

The following properties are set to the result object:

```javascript
  result.gulpIsort.success = true; // or false
  result.gulpIsort.errorCount = 0; // number of errors returned by isort
  result.gulpIsort.errorList = []; // isort errors
  result.gulpIsort.infoList = []; // isort messages and warnings
```

The objects in `errorList` and `infoList` all have the following properties

```javascript
result.gulpIsort.errorList = [{
  'filename': 'full path of the filename',
  'reason': 'a description of the error'
}]

result.gulpIsort.infoList = [{
  'filename': 'full path of the filename',
  'reason': 'a description of the error'
}]
```

## Custom Reporters

Custom reporter functions can be passed as ``gulpIsort.reporter(reporterFunc)``.
The reporter function will be called for each linted file that includes
an error or warning and will be passed the ``result`` object as described above.

```javascript
var gulpIsort = require('@petervanderdoes/gulp-isort');
var gulp = require('gulp');
var gulpUtil = require('gulp-util');

var myReporter = function(file) {
  gulpUtil.log(result.gulpIsort.errorCount + ' errors');
};

gulp.task('lint', function() {
  return gulp.src('*.py')
    .pipe(gulpIsort())
    .pipe(gulpIsort.reporter(myReporter));
});
```

See `src/reports.js` for more detailed examples.
