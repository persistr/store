module.exports = async (toolbox, identity, { db: dbName, ns: nsName, stream: streamID, annotation, account }) => {
  const { knex, store, uuid } = toolbox

  const db = await store.databases.find(identity, { name: dbName })
  const ns = await store.namespaces.find(identity, { dbID: db.id, name: nsName })

  const relation = {
    db: uuid.toBuffer(db.id),
    ns: uuid.toBuffer(ns.id),
    stream: uuid.toBuffer(streamID),
    annotation: JSON.stringify(annotation)
  }

  await knex('Annotations').insert(relation).onConflict(['db', 'ns', 'stream']).merge()
}
