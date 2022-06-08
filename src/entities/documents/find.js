const queryToKnex = require('../../util/querytoknex')

const findDocumentsForDatabase = async (toolbox, identity, { db: dbName, collection, query, options }) => {
  const { knex, store, uuid } = toolbox

  // query is a Mongo-like query:
  // { age: { $lt: 10 } }

  const db = await store.databases.find(identity, { name: dbName })

  const knexQuery = knex('Documents')
  queryToKnex(query, knexQuery)
  knexQuery.andWhere({ db: uuid.toBuffer(db.id), collection })

  if (options.skip) knexQuery.offset(Number(options.skip))
  if (options.limit) knexQuery.limit(Number(options.limit))

  // TODO: Needs to be modified to support sorting by elements within the JSON 'data' column.
  if (options.sort) knexQuery.orderBy(options.sort.by ?? options.sort, options.sort.order ?? 'asc')

  const results = await knexQuery
  return results.map(row => JSON.parse(row.data))
}

module.exports = async (toolbox, identity, options) => {
  return await findDocumentsForDatabase(toolbox, identity, options)
}
