'use strict'

const split = require('split2')
const t = require('tap')
const path = require('path')
const childProcess = require('child_process')

t.plan(4)

const args = [
  path.join(__dirname, '../tee.js'),
  'error',
  ':2'
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
  level: 50,
  msg: 'an error'
}]

const expected = [messages[2]]

messages.forEach(line => child.stdin.write(JSON.stringify(line) + '\n'))

child.stdout.pipe(split(JSON.parse)).on('data', function (data) {
  t.deepEqual(data, messages.shift())
})

child
  .stderr
  .pipe(split(JSON.parse))
  .on('data', function (data) {
    t.deepEqual(data, expected.shift())
  })
