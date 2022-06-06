const StoreError = require('./StoreError')
module.exports = class AnnotationNotFound extends StoreError {
  constructor (db, ns, stream) {
    super(`Annotation not found for stream ${db}.${ns}.${stream}`, 404)
  }
}
