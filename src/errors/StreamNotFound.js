const StoreError = require('./StoreError')
module.exports = class StreamNotFound extends StoreError {
  constructor (db, ns, stream) {
    super(`Stream ${stream} not found in ${db}.${ns}`, 404)
  }
}
