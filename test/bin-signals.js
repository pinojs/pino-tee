'use strict'

if (process.platform !== 'win32') {
  const fs = require('fs')
  const split = require('split2')
  const t = require('tap')
  const tmp = require('tmp')
  const path = require('path')
  const childProcess = require('child_process')
  const file = tmp.fileSync()
  const fileRot = tmp.fileSync()
  fs.unlinkSync(fileRot.name)

  t.plan(7)

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

  child.stdin.write(JSON.stringify(messages[0]) + '\n')
  child.stdin.write(JSON.stringify(messages[1]) + '\n')

  msleep(100)

  fs.renameSync(file.name, fileRot.name)
  child.kill('SIGHUP')

  msleep(100)

  t.ok(fs.existsSync(file.name))

  child.stdin.write(JSON.stringify(messages[2]) + '\n')

  child.stderr.pipe(process.stderr)

  child.stdout.pipe(split(JSON.parse)).on('data', function (data) {
    t.deepEqual(data, messages.shift())

    if (messages.length === 0) {
      checkFile()
    }
  })

  function checkFile () {
    fs.createReadStream(fileRot.name)
      .pipe(split(JSON.parse))
      .on('data', function (data) {
        t.deepEqual(data, expected.shift())
      })

    fs.createReadStream(file.name)
      .pipe(split(JSON.parse))
      .on('data', function (data) {
        t.ok(expected.length >= 1) // Makes sure that not everything was consumed by fileRot read
        t.deepEqual(data, expected.shift())
      })
  }

  function msleep (n) {
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, n) // eslint-disable-line
  }
}
