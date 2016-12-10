# pino-tee

Tee pino logs into a file, with multiple levels.
Works with any newline delimited json stream.

## API

### pinoTee(source)

Create a new `tee` instance from source. It is an extended instance of
[`cloneable-readable`](https://github.com/mcollina/cloneable-readable).

Example:

```js
const tee = require('pino-tee')
const fs = require('fs')
const stream = tee(process.stdin)
stream.tee(fs.createWriteStream('errors'), line => line.level >= 50)
stream.pipe(proess.stdout)
```

### stream.tee(dest, [filter])

Create a new stream that will filter a given line based on some
parameters. Each line is automatically parsed, or skipped

<a name="acknowledgements"></a>
## Acknowledgements

This project was kindly sponsored by [nearForm](http://nearform.com).

## License

MIT
