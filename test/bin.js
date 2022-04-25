'use strict'

const fs = require('fs')
const split = require('split2')
const { test } = require('tap')
const tmp = require('tmp')
const path = require('path')
const childProcess = require('child_process')

test('invoked with correct args', (t) => {
  t.plan(5)

  const file = tmp.fileSync()
  const args = [
    path.join(__dirname, '../tee.js'),
    'info',
    file.name
  ]

  const child = childProcess.spawn(process.execPath, args, {
    cwd: path.join(__dirname),
    env: process.env,
    stdio: ['pipe', 'pipe', 'pipe'],
    detached: false
  })

  t.teardown(() => {
    child.stdin.end()
    child.kill()
  })

  const messages = [{
    level: 30,
    msg: 'hello'
  }, {
    level: 20,
    msg: 'should not be seen'
  }, {
    level: 40,
    msg: 'a warning'
  }]

  const expected = [messages[0], messages[2]]

  messages.forEach(line => child.stdin.write(JSON.stringify(line) + '\n'))
  child.stderr.pipe(process.stderr)

  child.stdout.pipe(split(JSON.parse)).on('data', function (data) {
    t.same(data, messages.shift())
    if (messages.length === 0) {
      checkFile()
    }
  })

  function checkFile () {
    fs.createReadStream(file.name)
      .pipe(split(JSON.parse))
      .on('data', function (data) {
        t.same(data, expected.shift())
      })
  }
})

test('invoked with incorrect args', (t) => {
  t.plan(2)

  const args = [
    path.join('..', 'tee.js'),
    'info',
    'info.log',
    'warn'
    // 'no file name'
  ]

  const child = childProcess.spawn(process.execPath, args, {
    cwd: path.join(__dirname),
    env: process.env,
    stdio: ['pipe', 'pipe', 'pipe'],
    detached: false
  })

  const arr = []
  child.stderr.on('data', (d) => {
    console.log('stderr onData: ', d.toString())
    arr.push(d.toString())
  })

  child.on('close', (code) => {
    console.log('onClose code: ', code)
    console.log('onClose array: ', arr)

    t.same(arr, [
      'pino-tee requires an even amount of args\n',
      'Usage: pino-tee [filter dest]..\n'
    ])
    t.equal(code, 1)
  })
})
