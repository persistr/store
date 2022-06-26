const queryToKnex = require('../../util/querytoknex')

const countDocumentsForDatabase = async (toolbox, identity, { db: dbName, collection, query }) => {
  const { knex, store, uuid } = toolbox

  const db = await store.databases.find(identity, { name: dbName })

  const knexQuery = knex('Documents')
  queryToKnex(query, knexQuery, { strict: true })
  knexQuery.andWhere({ db: uuid.toBuffer(db.id), collection })
  knexQuery.count('id', { as: 'count' })

  const results = await knexQuery
  if (!results || results.length !== 1) return 0
  return results[0].count
}

module.exports = async (toolbox, identity, options) => {
  return await countDocumentsForDatabase(toolbox, identity, options)
}
