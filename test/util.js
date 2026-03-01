'use strict'

const test = require('node:test')
const sinon = require('sinon')

const { getLevelNumber, getDestinationStream } = require('../util')

test('getLevelNumber should return the correct level', async function (t) {
  t.assert.equal(getLevelNumber(40), 40)
  t.assert.equal(getLevelNumber('40'), 40)
  t.assert.equal(getLevelNumber('info'), 30)
  t.assert.equal(getLevelNumber('warn'), 40)
  t.assert.equal(getLevelNumber('error'), 50)
})

test('getLevelNumber should throw if an invalid level is provided', async function (t) {
  t.assert.throws(() => {
    getLevelNumber('invalid-level')
  })
  t.assert.throws(() => {
    getLevelNumber(() => {})
  })
})

test('getDestinationStream should call createWriteStream with appropriate params for filepath', async function (t) {
  const createWriteStreamStub = sinon.stub()
  getDestinationStream('./filepath', {
    fs: { createWriteStream: createWriteStreamStub }
  })
  sinon.assert.calledWith(createWriteStreamStub, './filepath', { flags: 'a' })
})

test('getDestinationStream should return process.stderr when', async function (t) {
  const stream = getDestinationStream(':2')

  t.assert.ok(stream._isStdio)
  t.assert.equal(stream.fd, 2)
})
