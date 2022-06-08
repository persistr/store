module.exports = async (toolbox, identity, { db: dbName, collection, id }) => {
  const { knex, store, uuid } = toolbox

  const db = await store.databases.find(identity, { name: dbName })

  const filter = { db: uuid.toBuffer(db.id), collection, id: uuid.toBuffer(id) }
  const results = await knex.select('data').from('Documents').where(filter)
  if (!results || !results[0]) return undefined

  const row = results[0]
  const doc = JSON.parse(row.data)
  return doc
}
