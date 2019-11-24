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

test('filters data using a custon level number', function (t) {
  t.plan(9)

  const lines = [{
    level: 30,
    msg: 'hello world'
  }, {
    level: 20,
    msg: 'a debug statement'
  }, {
    level: 35,
    msg: 'a custom level log line'
  }, {
    level: 40,
    msg: 'a warning'
  }]

  const lines2 = Array.from(lines)
  const lines30 = lines.filter(x => x.level >= 30)
  const lines35 = lines.filter(x => x.level >= 35)

  const teed30 = split(JSON.parse)
  const teed35 = split(JSON.parse)
  const dest = split(JSON.parse)
  const origin = new PassThrough()

  const instance = tee(origin)

  instance.pipe(dest)
  instance.tee(teed30, 30)
  instance.tee(teed35, 35)

  dest.on('data', function (d) {
    t.deepEqual(d, lines2.shift())
  })

  teed30.on('data', function (d) {
    t.deepEqual(d, lines30.shift())
  })

  teed35.on('data', function (d) {
    t.deepEqual(d, lines35.shift())
  })

  lines.forEach(line => origin.write(JSON.stringify(line) + '\n'))
})
