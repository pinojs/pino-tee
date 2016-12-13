'use strict'

const fs = require('fs')
const split = require('split2')
const t = require('tap')
const tmp = require('tmp')
const path = require('path')
const childProcess = require('child_process')
const file1 = tmp.fileSync()
const file2 = tmp.fileSync()

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

t.tearDown(() => {
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
  t.deepEqual(data, messages.shift())
  if (messages.length === 0) {
    checkFile('info', file1, expected1)
    checkFile('warn', file2, expected2)
  }
})

function checkFile (level, file, expected) {
  t.test('checking ' + level + ' file', function (t) {
    t.plan(expected.length)

    fs.createReadStream(file.name)
      .pipe(split(JSON.parse))
      .on('data', function (data) {
        t.deepEqual(data, expected.shift())
      })
  })
}
