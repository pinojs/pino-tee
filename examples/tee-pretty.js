const pinoms = require('pino-multi-stream')
const childProcess = require('child_process')
const stream = require('stream')

const cwd = process.cwd()
const { env } = process
const logPath = `${cwd}/log`

const logThrough = new stream.PassThrough()
const prettyStream = pinoms.prettyStream()
const streams = [
  { stream: logThrough },
  { stream: prettyStream }
]
const log = pinoms(pinoms.multistream(streams))

const child = childProcess.spawn(process.execPath, [
  '../tee', // Or require.resolve('pino-tee')
  'warn', `${logPath}/warn.log`,
  'error', `${logPath}/error.log`,
  'fatal', `${logPath}/fatal.log`
], { cwd, env })

logThrough.pipe(child.stdin)

// Writing some test logs
log.warn('WARNING 1')
log.error('ERROR 1')
log.fatal('FATAL 1')
