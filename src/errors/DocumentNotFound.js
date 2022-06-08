const StoreError = require('./StoreError')
module.exports = class DocumentNotFound extends StoreError {
  constructor (db, collection, id) {
    super(`Document not found for ${db}.${collection}.${id}`, 404)
  }
}
