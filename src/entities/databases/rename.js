const DatabaseNotFound = require('../../errors/DatabaseNotFound')
module.exports = async (toolbox, identity, { name, to: newName, account }) => {
  const { knex, store, uuid } = toolbox
  const db = await store.databases.find(identity, { name, account })
  await knex('Databases').where({ id: uuid.toBuffer(db.id) }).update({ name: newName })
}
