const AnnotationNotFound = require('../../errors/AnnotationNotFound')
module.exports = async (toolbox, identity, { db: dbName, ns: nsName, stream: streamID, account }) => {
  const { knex, store, uuid } = toolbox

  const db = await store.databases.find(identity, { name: dbName })
  const ns = await store.namespaces.find(identity, { dbID: db.id, name: nsName })

  const filter = { db: uuid.toBuffer(db.id), ns: uuid.toBuffer(ns.id), stream: uuid.toBuffer(streamID) }
  const results = await knex.select('annotation').from('Annotations').where(filter)
  if (!results || !results[0]) throw new AnnotationNotFound(dbName, nsName, streamID)

  const row = results[0]
  var annotation = JSON.parse(row.annotation)
  return annotation
}
