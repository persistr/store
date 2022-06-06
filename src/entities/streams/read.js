const StreamNotFound = require('../../errors/StreamNotFound')
module.exports = async (toolbox, identity, { db: dbName, ns: nsName, id }) => {
  const { knex, store, uuid } = toolbox

  const db = await store.databases.find(identity, { name: dbName })
  const ns = await store.namespaces.find(identity, { dbID: db.id, name: nsName })

  const results = await knex('Events')
    .leftJoin('Annotations', { 'Events.db': 'Annotations.db', 'Events.ns': 'Annotations.ns', 'Events.stream': 'Annotations.stream' })
    .where({ 'Events.db': uuid.toBuffer(db.id), 'Events.ns': uuid.toBuffer(ns.id), 'Events.stream': uuid.toBuffer(id) })
    .select('Annotations.annotation as annotation')
    .min('Events.ts', { as: 'first' })
    .max('Events.ts', { as: 'latest' })
    .count('*', { as: 'count' })
    .groupBy('Events.db', 'Events.ns', 'Events.stream')
  if (!results || !results[0]) throw new StreamNotFound(dbName, nsName, id)

  const row = results[0]
  const annotation = JSON.parse(row.annotation)
  const stream = {
    id,
    ns: ns.name,
    created: row.first,
    modified: row.latest,
    size: row.count,
    annotation
  }
  if (annotation && annotation.type) stream.type = annotation.type
  return stream
}
