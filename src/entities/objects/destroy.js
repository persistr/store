const ObjectNotFound = require('../../errors/ObjectNotFound')
module.exports = async (toolbox, identity, { db: dbName, id }) => {
  const { knex, store, uuid } = toolbox
  const db = await store.databases.find(identity, { name: dbName })
  const results = await knex('Objects').where({ db: uuid.toBuffer(db.id), id }).count('id', { as: 'count' })
  if (!results || !results.length || !results[0].count) throw new ObjectNotFound(dbName, id)
  await knex('Objects').where({ db: uuid.toBuffer(db.id), id }).del()
}
