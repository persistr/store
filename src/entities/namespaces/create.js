const NamespaceTaken = require('../../errors/NamespaceTaken')
module.exports = async (toolbox, identity, { name: nsName, db: dbName, account: accountID }) => {
  const { knex, store, trycatch, uuid } = toolbox

  const db = await store.databases.find(identity, { name: dbName, account: accountID })
  const nsID = uuid.v4()

  let [error] = await trycatch(knex('Namespaces').insert({ id: uuid.toBuffer(nsID), db: uuid.toBuffer(db.id), name: nsName }))
  if (error) throw new NamespaceTaken(nsName)

  return { id: nsID, name: nsName, account: { id: accountID }, database: { id: db.id, name: dbName, account: { id: accountID } }}
}
