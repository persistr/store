const StoreError = require('./StoreError')
module.exports = class CursorNotFound extends StoreError {
  constructor () {
    super(`Cursor not found`, 404)
  }
}
