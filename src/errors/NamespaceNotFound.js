const StoreError = require('./StoreError')
module.exports = class NamespaceNotFound extends StoreError {
  constructor (ns, db) {
    super(`Namespace ${ns} not found${db ? ' in database ' + db : ''}`, 404)
  }
}
