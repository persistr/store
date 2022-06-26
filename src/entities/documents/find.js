const queryToKnex = require('../../util/querytoknex')

const findDocumentsForDatabase = async (toolbox, identity, { db: dbName, collection, query, options }) => {
  const { knex, store, uuid } = toolbox

  // query is a Mongo-like query:
  // { age: { $lt: 10 } }

  const db = await store.databases.find(identity, { name: dbName })

  const knexQuery = knex('Documents')
  const filter = queryToKnex(query, knexQuery)
  knexQuery.andWhere({ db: uuid.toBuffer(db.id), collection })

  if (options?.skip) knexQuery.offset(Number(options.skip))
  if (options?.limit) knexQuery.limit(Number(options.limit))
  if (options?.sort) knexQuery.orderByRaw(`data->"$.${options.sort.by ?? options.sort}" ${options.sort.order ?? 'asc'}`)

  const results = await knexQuery
  return filter(results.map(row => JSON.parse(row.data)))
}

module.exports = async (toolbox, identity, options) => {
  return await findDocumentsForDatabase(toolbox, identity, options)
}
