const StoreError = require('./StoreError')
module.exports = class UsernameTaken extends StoreError {
  constructor (username) {
    super(`Username ${username} is not available`, 400)
  }
}
