const split = require('split2')
const Parse = require('fast-json-parse')
const { getDestinationStream, getLevelNumber } = require('./util')

module.exports = (options) => {
  const filters = Object
    .entries(options.filters)
    .map(([level, dest]) => [level, getDestinationStream(dest)])

  const splitter = split(line => {
    const res = new Parse(line)

    if (!res || !res.value) {
      throw new Error('Failed to parse line: ', line)
    }

    filters
      .filter(([level]) => res.value.level >= getLevelNumber(level))
      .forEach(([level, destination]) => {
        if (!destination) {
          throw new Error('No destination for level: ', level)
        }
        destination.write(line + '\n')
      })
  })

  // https://github.com/pinojs/thread-stream/issues/36#issuecomment-1008939471
  // This fixes the stream hanging and timing out at 10s
  splitter.end = splitter.destroy

  return splitter
}
