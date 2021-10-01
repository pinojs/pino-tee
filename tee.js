#! /usr/bin/env node
'use strict'

const split = require('split2')
const cloneable = require('cloneable-readable')
const pump = require('pump')
const Parse = require('fast-json-parse')
const minimist = require('minimist')
const pino = require('pino')
const { buildSafeSonicBoom } = require('pino/lib/tools')

function tee (origin) {
  const clone = cloneable(origin)

  clone.tee = function (dest, filter) {
    filter = filter || alwaysTrue
    pump(this.clone(), buildFilter(filter), dest)
    return dest
  }

  return clone
}

function buildFilter (filter) {
  if (typeof filter === 'number') {
    const num = filter
    filter = function (v) { return v.level >= num }
  } else if (typeof filter === 'string') {
    const num = pino.levels.values[filter]

    if (typeof num === 'number' && isFinite(num)) {
      filter = function (v) { return v.level >= num }
    } else {
      throw new Error('no such level')
    }
  }

  return split(function (line) {
    const res = new Parse(line)
    if (res.value && filter(res.value)) {
      return JSON.stringify(res.value) + '\n'
    } else {
      return undefined
    }
  })
}

function alwaysTrue () {
  return true
}

module.exports = tee

if (require.main === module) {
  start()
}

function start () {
  const args = minimist(process.argv.slice(2))
  const pairs = []
  let i

  if (args._.length % 2) {
    console.error('pino-tee requires an even amount of args')
    console.error('Usage: pino-tee [filter dest]..')
    process.exit(1)
  }

  for (i = 0; i < args._.length; i += 2) {
    let dest = args._[i + 1]
    if (dest === ':2') {
      dest = buildSafeSonicBoom({ fd: process.stderr.fd })
    } else {
      dest = buildSafeSonicBoom({ fd: dest })
    }

    pairs.push({
      filter: args._[i],
      dest
    })
  }

  function reopenAll () {
    pairs.forEach(pair => pair.dest.reopen())
  }

  process.on('SIGHUP', reopenAll)
  process.on('SIGUSR1', reopenAll)
  process.on('SIGUSR2', reopenAll)

  const instance = tee(process.stdin)
  pairs.forEach(pair => instance.tee(pair.dest, pair.filter))
  instance.pipe(process.stdout)
}
