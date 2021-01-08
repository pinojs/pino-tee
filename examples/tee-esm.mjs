import pino from 'pino'
import childProcess from 'child_process'
import stream from 'stream'

// Environment variables
const cwd = process.cwd()
const { env } = process
const logPath = `${cwd}/log`

// Create a stream where the logs will be written
const logThrough = new stream.PassThrough()
const log = pino({ name: 'project' }, logThrough)

// Log to multiple files using a separate process
const child = childProcess.spawn(process.execPath, [
  '../tee', // Or path to pino-tee
  'warn', `${logPath}/warn.log`,
  'error', `${logPath}/error.log`,
  'fatal', `${logPath}/fatal.log`
], { cwd, env })

logThrough.pipe(child.stdin)

// Writing some test logs
log.warn('WARNING 1')
log.error('ERROR 1')
log.fatal('FATAL 1')
