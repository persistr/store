const StoreError = require('./StoreError')
module.exports = class AccountNotFound extends StoreError {
  constructor () {
    super(`Account not found`, 404)
  }
}
