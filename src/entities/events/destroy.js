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
  const results = await knex('Events').where(filter).count('id', { as: 'count' })
  if (!results || !results.length || !results[0].count) throw new EventNotFound(dbName, nsName, streamID, eventID)
  await knex('Events').where(filter).del()
}
