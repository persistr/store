const StoreError = require('./StoreError')
module.exports = class DuplicateEvent extends StoreError {
  constructor (id) {
    super(`Event already exists with identifier ${id}`, 400)
  }
}
