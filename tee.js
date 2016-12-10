'use strict'

const split = require('split2')
const cloneable = require('cloneable-readable')
const pump = require('pump')
const Parse = require('fast-json-parse')

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
