const DocumentNotFound = require('../../errors/DocumentNotFound')
module.exports = async (toolbox, identity, { db: dbName, collection, id }) => {
  const { knex, store, uuid } = toolbox
  const db = await store.databases.find(identity, { name: dbName })
  const key = { 'db': uuid.toBuffer(db.id), collection, id: uuid.toBuffer(id) }
  const results = await knex('Documents').where(key).count('id', { as: 'count' })
  if (!results || !results.length || !results[0].count) throw new DocumentNotFound(dbName, collection, id)
  await knex('Documents').where(key).del()
}
