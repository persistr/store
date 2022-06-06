const NamespaceNotFound = require('../../errors/NamespaceNotFound')
const NamespaceTaken = require('../../errors/NamespaceTaken')
module.exports = async (toolbox, identity, { db: dbName, name: nsName, to: nsNewName, account: accountID }) => {
  const { knex, store, trycatch, uuid } = toolbox
  const db = await store.databases.find(identity, { name: dbName, account: accountID })
  const results = await knex('Namespaces').where({ db: uuid.toBuffer(db.id), name: nsName }).count('id', { as: 'count' })
  if (!results || !results.length || !results[0].count) throw new NamespaceNotFound(nsName, db)
  let [error] = await trycatch(knex('Namespaces').where({ db: uuid.toBuffer(db.id), name: nsName }).update({ name: nsNewName }))
  if (error) throw new NamespaceTaken(nsNewName)
}
