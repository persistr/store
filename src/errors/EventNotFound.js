const StoreError = require('./StoreError')
module.exports = class EventNotFound extends StoreError {
  constructor (db, ns, stream, event) {
    super(`Event ${event} not found in ${db}.${ns}.${stream}`, 404)
  }
}
