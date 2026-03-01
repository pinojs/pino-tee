'use strict'

const test = require('node:test')
const fs = require('node:fs')
const path = require('node:path')
const childProcess = require('node:child_process')
const split = require('split2')
const tmp = require('tmp')
const file1 = tmp.fileSync()
const file2 = tmp.fileSync()

test('bin-multiple', (t, done) => {
  t.plan(5)

  const args = [
    path.join(__dirname, '../tee.js'),
    'info',
    file1.name,
    'warn',
    file2.name
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

  const expected1 = [messages[0], messages[2]]
  const expected2 = [messages[2]]

  messages.forEach(line => child.stdin.write(JSON.stringify(line) + '\n'))
  child.stderr.pipe(process.stderr)

  child.stdout.pipe(split(JSON.parse)).on('data', function (data) {
    t.assert.deepEqual(data, messages.shift())
    if (messages.length === 0) {
      checkFile('info', file1, expected1, () => {
        checkFile('warn', file2, expected2, done)
      })
    }
  })

  function checkFile (level, file, expected, cb) {
    t.test('checking ' + level + ' file', function (t, done) {
      t.plan(expected.length)

      fs.createReadStream(file.name)
        .pipe(split(JSON.parse))
        .on('data', function (data) {
          t.assert.deepEqual(data, expected.shift())
        })
        .on('end', () => {
          cb()
          done()
        })
    })
  }
})
