const StoreError = require('./StoreError')
module.exports = class RoleNotFound extends StoreError {
  constructor (role) {
    super(`Role "${role}" not found`, 404)
  }
}
