'use strict'

const test = require('node:test')
const fs = require('node:fs')
const path = require('node:path')
const childProcess = require('node:child_process')
const split = require('split2')
const tmp = require('tmp')

test('invoked with correct args', (t, done) => {
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

  t.after(() => {
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
    t.assert.deepEqual(data, messages.shift())
    if (messages.length === 0) {
      checkFile()
    }
  })

  function checkFile () {
    fs.createReadStream(file.name)
      .pipe(split(JSON.parse))
      .on('data', function (data) {
        t.assert.deepEqual(data, expected.shift())
      })
      .on('end', done)
  }
})

test('invoked with incorrect args', (t, done) => {
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
    arr.push(d.toString())
  })

  child.on('close', (code) => {
    t.assert.deepEqual(arr, [
      'pino-tee requires an even number of args\nUsage: pino-tee [filter dest].\n'
    ])
    t.assert.equal(code, 1)
    done()
  })
})
