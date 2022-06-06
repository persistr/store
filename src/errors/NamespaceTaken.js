const StoreError = require('./StoreError')
module.exports = class NamespaceTaken extends StoreError {
  constructor (ns) {
    super(`Namespace ${ns} is already in use`, 400)
  }
}
