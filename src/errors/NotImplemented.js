const StoreError = require('./StoreError')
module.exports = class NotImplemented extends StoreError {
  constructor (message) {
    super(`Not implemented${message ? ': ' + message : ''}`, 501)
  }
}
