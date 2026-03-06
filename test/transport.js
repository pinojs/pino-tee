'use strict'

const test = require('node:test')
const sinon = require('sinon')

const filters = {
  info: './info.log',
  error: './error.log',
  warn: './warn.log'
}

const streamStub = () => ({ write: sinon.stub() })

const destinationStreamStubs = {
  [filters.info]: streamStub(),
  [filters.error]: streamStub(),
  [filters.warn]: streamStub()
}

const { teeTransport: tt } = require('../transport')
const teeTransport = function (options) {
  return tt(options, {
    getDestinationStream (dest) {
      return destinationStreamStubs[dest]
    },
    getLevelNumber: require('../util').getLevelNumber
  })
}

test('should write to info destination stream correctly', async () => {
  const lineParser = teeTransport({ filters })

  const infoMsg = JSON.stringify({ level: 30, time: 1522431328992, msg: 'info-msg' })
  lineParser(infoMsg)
  sinon.assert.calledWith(destinationStreamStubs[filters.info].write, infoMsg + '\n')
})

test('should write to warn destination stream correctly', async () => {
  const lineParser = teeTransport({ filters })

  const warnMsg = JSON.stringify({ level: 40, time: 1522431328992, msg: 'warn-msg' })
  lineParser(warnMsg)
  sinon.assert.calledWith(destinationStreamStubs[filters.warn].write, warnMsg + '\n')
})

test('should write to error destination stream correctly', async () => {
  const lineParser = teeTransport({ filters })

  const errorMsg = JSON.stringify({ level: 50, time: 1522431328992, msg: 'error-msg' })
  lineParser(errorMsg)
  sinon.assert.calledWith(destinationStreamStubs[filters.error].write, errorMsg + '\n')
})

test('should throw when invalid json is supplied', async (t) => {
  const lineParser = teeTransport({ filters })

  t.assert.throws(() => lineParser('invalid-json'))
})

test('should return writable stream from default export ', async (t) => {
  const teeTransport = require('../transport')

  const stream = teeTransport({ filters })

  t.assert.equal(typeof stream, 'object')
  t.assert.ok(stream.write)
})
