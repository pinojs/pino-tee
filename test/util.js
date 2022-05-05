const tap = require('tap')
const sinon = require('sinon')
const proxyquire = require('proxyquire')

const { getLevelNumber, getDestinationStream } = require('../util')

tap.test('getLevelNumber should return the correct level', async function (t) {
  t.equal(getLevelNumber(40), 40)
  t.equal(getLevelNumber('40'), 40)
  t.equal(getLevelNumber('info'), 30)
  t.equal(getLevelNumber('warn'), 40)
  t.equal(getLevelNumber('error'), 50)
})

tap.test('getLevelNumber should throw if an invalid level is provided', async function (t) {
  t.throws(() => {
    getLevelNumber('invalid-level')
  })
  t.throws(() => {
    getLevelNumber(() => {})
  })
})

tap.test('getDestinationStream should call createWriteStream with appropriate params for filepath', async function (t) {
  const createWriteStreamStub = sinon.stub()

  const { getDestinationStream } = proxyquire('../util', {
    fs: { createWriteStream: createWriteStreamStub }
  })

  getDestinationStream('./filepath')
  sinon.assert.calledWith(createWriteStreamStub, './filepath', { flags: 'a' })
})

tap.test('getDestinationStream should return process.stderr when', async function (t) {
  const stream = getDestinationStream(':2')

  t.ok(stream._isStdio)
  t.equal(stream.fd, 2)
})
