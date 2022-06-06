const StoreError = require('./StoreError')
module.exports = class InvalidRequestBody extends StoreError {
  constructor (url, reason) {
    super(`Invalid body in request: ${url}\nWhat went wrong:\n${reason}`, 400)
  }
}
