const queryToKnex = require('../../util/querytoknex')

const countDocumentsForDatabase = async (toolbox, identity, { db: dbName, collection, query }) => {
  const { knex, store, uuid } = toolbox

  const db = await store.databases.find(identity, { name: dbName })

  const knexQuery = knex('Documents')
  const complexRegexList = []
  queryToKnex(query, knexQuery, complexRegexList)
  knexQuery.andWhere({ db: uuid.toBuffer(db.id), collection })
  knexQuery.count('id', { as: 'count' })

  let results = await knexQuery
  if(complexRegexList.length>0){
    results = results.filter(row => {
      return complexRegexList.some(item=>{
        const regexp = new RegExp(item.value)
        return regexp.test(row[item.column])
      })
    })
  }
  if (!results || results.length !== 1) return 0
  return results[0].count
}

module.exports = async (toolbox, identity, options) => {
  return await countDocumentsForDatabase(toolbox, identity, options)
}
