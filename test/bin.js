'use strict'

const fs = require('fs')
const split = require('split2')
const t = require('tap')
const tmp = require('tmp')
const path = require('path')
const childProcess = require('child_process')
const file = tmp.fileSync()

t.plan(5)

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

const expected = [messages[0], messages[2]]

messages.forEach(line => child.stdin.write(JSON.stringify(line) + '\n'))
child.stderr.pipe(process.stderr)

child.stdout.pipe(split(JSON.parse)).on('data', function (data) {
  t.deepEqual(data, messages.shift())
  if (messages.length === 0) {
    checkFile()
  }
})

function checkFile () {
  fs.createReadStream(file.name)
    .pipe(split(JSON.parse))
    .on('data', function (data) {
      t.deepEqual(data, expected.shift())
    })
}
