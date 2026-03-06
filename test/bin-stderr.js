'use strict'

const test = require('node:test')
const path = require('node:path')
const childProcess = require('node:child_process')
const split = require('split2')

test('bin-stderr', (t, done) => {
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
    level: 50,
    msg: 'an error'
  }]

  const expected = [messages[2]]

  messages.forEach(line => child.stdin.write(JSON.stringify(line) + '\n'))

  let count = 0
  child.stdout.pipe(split(JSON.parse)).on('data', function (data) {
    count++
    t.assert.deepEqual(data, messages.shift())
    end()
  })

  child
    .stderr
    .pipe(split(JSON.parse))
    .on('data', function (data) {
      count++
      t.assert.deepEqual(data, expected.shift())
      end()
    })

  function end () {
    if (count >= 4) done()
  }
})
