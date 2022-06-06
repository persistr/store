const StoreError = require('./StoreError')
module.exports = class TriggerNotFound extends StoreError {
  constructor () {
    super(`Trigger not found`, 404)
  }
}
