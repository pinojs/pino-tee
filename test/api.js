'use strict'

const split = require('split2')
const test = require('tap').test
const PassThrough = require('readable-stream').PassThrough
const tee = require('..')

test('tee some logs into another stream', function (t) {
  t.plan(4)

  const lines = [{
    level: 30,
    msg: 'hello world'
  }, {
    level: 40,
    msg: 'a warning'
  }]

  const lines2 = Array.from(lines)
  const lines3 = Array.from(lines)

  const teed = split(JSON.parse)
  const dest = split(JSON.parse)
  const origin = new PassThrough()

  const instance = tee(origin)

  instance.pipe(dest)
  instance.tee(teed)

  dest.on('data', function (d) {
    t.deepEqual(d, lines2.shift())
  })

  teed.on('data', function (d) {
    t.deepEqual(d, lines3.shift())
  })

  lines.forEach(line => origin.write(JSON.stringify(line) + '\n'))
})

test('tee some logs into another stream after a while', function (t) {
  t.plan(4)

  const lines = [{
    level: 30,
    msg: 'hello world'
  }, {
    level: 40,
    msg: 'a warning'
  }]

  const lines2 = Array.from(lines)
  const lines3 = Array.from(lines)

  const teed = split(JSON.parse)
  const dest = split(JSON.parse)
  const origin = new PassThrough()

  const instance = tee(origin)

  setImmediate(function () {
    instance.tee(teed)

    setImmediate(function () {
      instance.pipe(dest)
    })
  })

  dest.on('data', function (d) {
    t.deepEqual(d, lines2.shift())
  })

  teed.on('data', function (d) {
    t.deepEqual(d, lines3.shift())
  })

  lines.forEach(line => origin.write(JSON.stringify(line) + '\n'))
})

test('filters data', function (t) {
  t.plan(3)

  const lines = [{
    level: 30,
    msg: 'hello world'
  }, {
    level: 40,
    msg: 'a warning'
  }]

  const lines2 = Array.from(lines)
  const lines3 = [lines[1]]

  const teed = split(JSON.parse)
  const dest = split(JSON.parse)
  const origin = new PassThrough()

  const instance = tee(origin)

  instance.pipe(dest)
  instance.tee(teed, line => line.level > 30)

  dest.on('data', function (d) {
    t.deepEqual(d, lines2.shift())
  })

  teed.on('data', function (d) {
    t.deepEqual(d, lines3.shift())
  })

  lines.forEach(line => origin.write(JSON.stringify(line) + '\n'))
})

test('skip non-json lines', function (t) {
  t.plan(3)

  const lines = [JSON.stringify({
    level: 30,
    msg: 'hello world'
  }), 'muahahha']

  const lines2 = Array.from(lines)
  const lines3 = [lines[0]]

  const teed = split()
  const dest = split()
  const origin = new PassThrough()

  const instance = tee(origin)

  instance.pipe(dest)
  instance.tee(teed)

  dest.on('data', function (d) {
    t.deepEqual(d, lines2.shift())
  })

  teed.on('data', function (d) {
    t.deepEqual(d, lines3.shift())
  })

  lines.forEach(line => origin.write(line + '\n'))
})

test('filters data using a level name', function (t) {
  t.plan(5)

  const lines = [{
    level: 30,
    msg: 'hello world'
  }, {
    level: 20,
    msg: 'a debug statement'
  }, {
    level: 40,
    msg: 'a warning'
  }]

  const lines2 = Array.from(lines)
  const lines3 = [lines[0], lines[2]]

  const teed = split(JSON.parse)
  const dest = split(JSON.parse)
  const origin = new PassThrough()

  const instance = tee(origin)

  instance.pipe(dest)
  instance.tee(teed, 'info')

  dest.on('data', function (d) {
    t.deepEqual(d, lines2.shift())
  })

  teed.on('data', function (d) {
    t.deepEqual(d, lines3.shift())
  })

  lines.forEach(line => origin.write(JSON.stringify(line) + '\n'))
})
