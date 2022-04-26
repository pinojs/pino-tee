const pino = require('pino')

const pinoTee = pino.transport({
  target: 'pino-tee',
  options: {
    filters: {
      info: 'info.log',
      warn: 'warn.log'
    }
  }
})

const logger = pino(pinoTee)

logger.info('example info log')
logger.error('example error log')
