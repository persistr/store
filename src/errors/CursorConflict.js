const StoreError = require('./StoreError')
module.exports = class CursorConflict extends StoreError {
  constructor () {
    super(`Cursor could not be advanced due to conflict`, 409)
  }
}
