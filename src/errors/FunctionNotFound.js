const StoreError = require('./StoreError')
module.exports = class FunctionNotFound extends StoreError {
  constructor () {
    super(`Function not found`, 404)
  }
}
