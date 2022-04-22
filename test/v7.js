// const tap = require('tap')
// const sinon = require('sinon')

// const filters = {
//   info: './info.log',
//   error: './error.log',
//   warn: './warn.log'
// }

// const streamStub = () => ({ write: sinon.stub() })

// const destinationStreamStubs = {
//   [filters.info]: streamStub(),
//   [filters.error]: streamStub(),
//   [filters.warn]: streamStub()
// }

// const { teeTransport } = tap.mock('../v7', {
//   '../util': {
//     getLevelNumber: require('../util').getLevelNumber,
//     getDestinationStream: (dest) => {
//       return destinationStreamStubs[dest]
//     }
//   }
// })

// tap.test('should write to info destination stream correctly', async (t) => {
//   const lineParser = teeTransport({ filters })

//   const infoMsg = JSON.stringify({ level: 30, time: 1522431328992, msg: 'info-msg' })
//   lineParser(infoMsg)
//   sinon.assert.calledWith(destinationStreamStubs[filters.info].write, infoMsg + '\n')
// })

// tap.test('should write to warn destination stream correctly', async (t) => {
//   const lineParser = teeTransport({ filters })

//   const warnMsg = JSON.stringify({ level: 40, time: 1522431328992, msg: 'warn-msg' })
//   lineParser(warnMsg)
//   sinon.assert.calledWith(destinationStreamStubs[filters.warn].write, warnMsg + '\n')
// })

// tap.test('should write to error destination stream correctly', async (t) => {
//   const lineParser = teeTransport({ filters })

//   const errorMsg = JSON.stringify({ level: 50, time: 1522431328992, msg: 'error-msg' })
//   lineParser(errorMsg)
//   sinon.assert.calledWith(destinationStreamStubs[filters.error].write, errorMsg + '\n')
// })

// tap.test('should throw when invalid json is supplied', async (t) => {
//   const lineParser = teeTransport({ filters })

//   t.throws(() => lineParser('invalid-json'))
// })

// tap.test('should return writable stream from default export ', async (t) => {
//   const teeTransport = require('../v7')

//   const stream = teeTransport({ filters })

//   t.equal(typeof stream, 'object')
//   t.ok(stream.write)
// })
