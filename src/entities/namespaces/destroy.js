module.exports = async (toolbox, identity, { name: nsName, db: dbName, account: accountID }) => {
  const { knex, store, uuid } = toolbox

  const db = await store.databases.find(identity, { name: dbName, account: accountID })
  const ns = await store.namespaces.find(identity, { dbID: db.id, name: nsName })

  await Promise.all([
    knex('Namespaces').where({ db: uuid.toBuffer(db.id), name: nsName }).del(),
    knex('Events').where({ db: uuid.toBuffer(db.id), ns: uuid.toBuffer(ns.id) }).del(),
    knex('Annotations').where({ db: uuid.toBuffer(db.id), ns: uuid.toBuffer(ns.id) }).del()
  ])
}
