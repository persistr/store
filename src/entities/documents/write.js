module.exports = async (toolbox, identity, { db: dbName, collection, doc }) => {
  const { knex, store, uuid } = toolbox

  const db = await store.databases.find(identity, { name: dbName })

  if (!doc.id) doc.id = uuid.v4()
  const relation = {
    db: uuid.toBuffer(db.id),
    collection,
    id: uuid.toBuffer(doc.id),
    data: doc
  }

  await knex('Documents').insert(relation).onConflict(['db', 'collection', 'id']).merge()

  return doc
}
