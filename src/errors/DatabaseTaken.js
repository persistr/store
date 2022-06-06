const StoreError = require('./StoreError')
module.exports = class DatabaseTaken extends StoreError {
  constructor (db) {
    super(`Database ${db} is already in use`, 400)
  }
}
