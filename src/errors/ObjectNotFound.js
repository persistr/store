const StoreError = require('./StoreError')
module.exports = class ObjectNotFound extends StoreError {
  constructor () {
    super(`Object not found`, 404)
  }
}
