const uuidParse = require('uuid-parse')
const { v4: uuidv4 } = require('uuid')

module.exports = {
  v4: () => uuidv4(),
  toBuffer: uuid => Buffer.from(uuidParse.parse(uuid)),
  fromBuffer: buffer => uuidParse.unparse(buffer)
}
