const EventNotFound = require('../../errors/EventNotFound')
module.exports = async (toolbox, identity, { db: dbName, ns: nsName, stream: streamID, event: eventID }) => {
  const { knex, store, trycatch, uuid } = toolbox

  const db = await store.databases.find(identity, { name: dbName })
  const [error, ns] = await trycatch(store.namespaces.find(identity, { dbID: db.id, name: nsName }))
  if (error) throw new EventNotFound(dbName, nsName, streamID, eventID)

  const filter = {
    db: uuid.toBuffer(db.id),
    ns: uuid.toBuffer(ns.id),
    stream: uuid.toBuffer(streamID),
    id: uuid.toBuffer(eventID)
  }
  const results = await knex.select('*').from('Events').where(filter)
  if (!results || !results[0]) throw new EventNotFound(dbName, nsName, streamID, eventID)

  const row = results[0]
  var event = { data: JSON.parse(row.data), meta: JSON.parse(row.meta) }
  return event
}
