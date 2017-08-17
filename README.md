# pino-tee&nbsp;&nbsp;[![Build Status](https://travis-ci.org/pinojs/pino-tee.svg?branch=master)](https://travis-ci.org/pinojs/pino-tee)

Tee [pino](https://github.com/pinojs/pino) logs into multiple files,
according to the given levels.
Works with any newline delimited json stream.

## Install

```bash
npm i pino-tee -g
```

## Usage

##### CLI

The following writes the log output of `app.js` to `./all-logs`, while
writing only warnings and errors to `./warn-log:

```bash
node app.js | pino-tee warn ./warn-logs > ./all-logs
```

##### NodeJS

You can log to multiple files by spawning a child process:

```javascript
const pino = require('pino');
const childProcess = require('child_process');
const stream = require('stream');

// Environment variables
const cwd = process.cwd();
const {env} = process;
const logPath = `${cwd}/log`;

// Create a stream where the logs will be written
const logThrough = new stream.PassThrough();
const log = pino({name: 'project'}, logThrough);

// Log to multiple files using a separate process
const child = childProcess.spawn(process.execPath, [
  require.resolve('pino-tee'),
  'warn', `${logPath}/warn.log`,
  'error', `${logPath}/error.log`,
  'fatal', `${logPath}/fatal.log`
], {cwd, env});

logThrough.pipe(child.stdin);

// Log pretty messages to console (optional, for development purposes only)
const pretty = pino.pretty();
pretty.pipe(process.stdout);
logThrough.pipe(pretty);
```

## API

### pinoTee(source)

Create a new `tee` instance from source. It is an extended instance of
[`cloneable-readable`](https://github.com/mcollina/cloneable-readable).

Example:

```js
const tee = require('pino-tee')
const fs = require('fs')
const stream = tee(process.stdin)
stream.tee(fs.createWriteStream('errors'), line => line.level >= 50)
stream.pipe(process.stdout)
```

### stream.tee(dest, [filter])

Create a new stream that will filter a given line based on some
parameters. Each line is automatically parsed, or skipped if it is not
a newline delimited json.

The filter can be a `function` with signature `filter(line)`, where
`line`  is a parsed JSON object. The filter can also be one of the
[pino levels](https://github.com/pinojs/pino#loggerlevel), in that case
_all log lines with that level or greater will be written_.

<a name="acknowledgements"></a>

## Acknowledgements

This project was kindly sponsored by [nearForm](http://nearform.com).

## License

MIT
