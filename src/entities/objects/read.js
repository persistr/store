const ObjectNotFound = require('../../errors/ObjectNotFound')
module.exports = async (toolbox, identity, { db: dbName, id }) => {
  const { knex, store, uuid } = toolbox
  const db = await store.databases.find(identity, { name: dbName })
  const results = await knex.select('data').from('Objects').where({ db: uuid.toBuffer(db.id), id })
//  if (!results || !results[0]) throw new ObjectNotFound(dbName, id)
  if (!results || !results[0]) return undefined
  return JSON.parse(results[0].data)
}
