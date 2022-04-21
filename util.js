const fs = require('fs')
const pino = require('pino')

function getDestinationStream (destination) {
  return (destination === ':2')
    ? process.stderr
    : fs.createWriteStream(destination, { flags: 'a' })
}

function getLevelNumber (level) {
  if (typeof level === 'number' || !isNaN(Number(level))) {
    return Number(level)
  }

  if (typeof level === 'string') {
    const num = pino.levels.values[level]
    if (typeof num === 'number' && isFinite(num)) {
      return num
    } else {
      throw new Error('no such level')
    }
  }
}

module.exports = {
  getLevelNumber,
  getDestinationStream
}
