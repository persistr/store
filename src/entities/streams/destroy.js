const StreamNotFound = require('../../errors/StreamNotFound')
module.exports = async (toolbox, identity, { db: dbName, ns: nsName, id: streamID, account: accountID }) => {
  const { knex, store, uuid } = toolbox

  const db = await store.databases.find(identity, { name: dbName })
  const ns = await store.namespaces.find(identity, { dbID: db.id, name: nsName })

  const filter = {
    db: uuid.toBuffer(db.id),
    ns: uuid.toBuffer(ns.id),
    stream: uuid.toBuffer(streamID)
  }
  const results = await knex('Events').where(filter).count('id', { as: 'count' })
  if (!results || !results.length || !results[0].count) throw new StreamNotFound(dbName, nsName, streamID)
  await knex('Events').where(filter).del()
}
