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

Specify a minimum log level to write to file.

The following writes **info**, **warn** and **error** level logs to `./info-warn-error-log`, and all output of `app.js` to `./all-logs`:

```bash
node app.js | pino-tee info ./info-warn-error-logs | tee -a ./all-logs
```

(using `tee -a ./all-logs` will both write to `./all-logs` and `stdout`, enabling piping of more pino transports)

##### NodeJS

You can log to multiple files by spawning a child process. In the following example pino-tee writes into three different files for warn, error & fatal log levels.

```javascript
const pino = require('pino')
const childProcess = require('child_process')
const stream = require('stream')

// Environment variables
const cwd = process.cwd()
const { env } = process
const logPath = `${cwd}/log`

// Create a stream where the logs will be written
const logThrough = new stream.PassThrough()
const log = pino({ name: 'project' }, logThrough)

// Log to multiple files using a separate process
const child = childProcess.spawn(process.execPath, [
  require.resolve('pino-tee'),
  'warn', `${logPath}/warn.log`,
  'error', `${logPath}/error.log`,
  'fatal', `${logPath}/fatal.log`
], { cwd, env })

logThrough.pipe(child.stdin)

// Writing some test logs
log.warn('WARNING 1')
log.error('ERROR 1')
log.fatal('FATAL 1')
```

This prints raw logs into log files, you can also print pretty logs to the console for development purposes. For that, you need to use [pino-multi-stream](http://npm.im/pino-multi-stream). See the example below

```js
const pinoms = require('pino-multi-stream')
const childProcess = require('child_process')
const stream = require('stream')

const cwd = process.cwd()
const { env } = process

const logThrough = new stream.PassThrough()
const prettyStream = pinoms.prettyStream()
const streams = [
  { stream: logThrough },
  { stream: prettyStream }
]
const log = pinoms(pinoms.multistream(streams))

const child = childProcess.spawn(process.execPath, [
  require.resolve('pino-tee'),
  'warn', `${__dirname}/warn`,
  'error', `${__dirname}/error`,
  'fatal', `${__dirname}/fatal`
], { cwd, env })

logThrough.pipe(child.stdin)

// Writing some test logs
log.warn('WARNING 1')
log.error('ERROR 1')
log.fatal('FATAL 1')
```

Here, we're tapping into the write stream that pino-tee gets and manually formatting the log line using `pino-pretty` to write on the `stdout`. Note that the pretty printing is typically only done while developing.

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
[pino levels](https://github.com/pinojs/pino#loggerlevel) either
as text or as a custom level number, in that case _all log lines with
that level or greater will be written_.

<a name="acknowledgements"></a>

## Acknowledgements

This project was kindly sponsored by [nearForm](http://nearform.com).

## License

MIT
