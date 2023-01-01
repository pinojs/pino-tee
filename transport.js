const split = require('split2')
const Parse = require('fast-json-parse')
const { getDestinationStream, getLevelNumber } = require('./util')

const teeTransport = options => {
  const filters = Object
    .entries(options.filters)
    .map(([level, dest]) => [level, getDestinationStream(dest)])

  return line => {
    const res = new Parse(line)

    if (!res.value) {
      throw new Error('Failed to parse line: ', line)
    }

    filters
      .filter(([level]) => res.value.level >= getLevelNumber(level))
      .forEach(([, destination]) => destination.write(line + '\n'))
  }
}

module.exports = (options) => {
  const splitter = split(teeTransport(options))
  // https://github.com/pinojs/thread-stream/issues/36#issuecomment-1008939471
  // This fixes the stream hanging and timing out at 10s
  splitter.end = splitter.destroy
  return splitter
}

module.exports.teeTransport = teeTransport
