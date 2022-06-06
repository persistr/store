const StoreError = require('./StoreError')
module.exports = class TriggerTaken extends StoreError {
  constructor (trigger) {
    super(`Trigger ${trigger} is already in use`, 400)
  }
}
