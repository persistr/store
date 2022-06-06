const StoreError = require('./StoreError')
module.exports = class DatabaseNotFound extends StoreError {
  constructor (name) {
    super(`Database ${name} not found`, 404)
  }
}
