const StoreError = require('./StoreError')
module.exports = class CursorTaken extends StoreError {
  constructor (name) {
    super(`Cursor named '${name}' already exists`, 400)
  }
}
