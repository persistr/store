module.exports = async (toolbox, identity, { db: dbName, id, data }) => {
  const { knex, store, uuid } = toolbox
  const db = await store.databases.find(identity, { name: dbName })
  const object = { db: uuid.toBuffer(db.id), id, data: JSON.stringify(data) }
  const result = await knex('Objects').insert(object).onConflict(['db', 'id']).merge()
}
