module.exports = async (toolbox, identity, { name, account }) => {
  const { knex, store, uuid } = toolbox
  const db = await store.databases.find(identity, { name, account })
  await Promise.all([
    knex('Events').where('db', uuid.toBuffer(db.id)).del(),
    knex('Annotations').where('db', uuid.toBuffer(db.id)).del(),
    knex('Namespaces').where('db', uuid.toBuffer(db.id)).del(),
    knex('Databases').where('id', uuid.toBuffer(db.id)).del(),
    knex('AccountDatabases').where('idDB', uuid.toBuffer(db.id)).del()
  ])
}
