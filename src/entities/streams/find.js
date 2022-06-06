const findStreamsForNamespace = async (toolbox, identity, dbName, nsName) => {
  const { knex, store, uuid } = toolbox

  const db = await store.databases.find(identity, { name: dbName })
  const ns = await store.namespaces.find(identity, { dbID: db.id, name: nsName })

  const streams = knex('Events').distinct('stream').where({ db: uuid.toBuffer(db.id), ns: uuid.toBuffer(ns.id) }).orderBy('stream', 'asc')
  const results = await knex('Events')
    .leftJoin('Annotations', { 'Events.db': 'Annotations.db', 'Events.ns': 'Annotations.ns', 'Events.stream': 'Annotations.stream' })
    .where({ 'Events.db': uuid.toBuffer(db.id), 'Events.ns': uuid.toBuffer(ns.id) })
    .andWhere('Events.stream', 'in', streams)
    .select('Events.stream as stream', 'Annotations.annotation as annotation')
    .min('Events.ts', { as: 'first' })
    .max('Events.ts', { as: 'latest' })
    .count('*', { as: 'count' })
    .groupBy('Events.db', 'Events.ns', 'Events.stream')

  return results.map(row => {
    const annotation = JSON.parse(row.annotation)
    const stream = {
      id: uuid.fromBuffer(row.stream),
      ns: ns.name,
      created: row.first,
      modified: row.latest,
      size: row.count,
      annotation
    }
    if (annotation && annotation.type) stream.type = annotation.type
    return stream
  })
}

const findStreamsForDatabase = async (toolbox, identity, dbName) => {
  const { knex, store, uuid } = toolbox

  const db = await store.databases.find(identity, { name: dbName })

  const streams = knex('Events').distinct('stream').where({ db: uuid.toBuffer(db.id) }).orderBy('stream', 'asc')
  const results = await knex('Events')
    .leftJoin('Annotations', { 'Events.db': 'Annotations.db', 'Events.ns': 'Annotations.ns', 'Events.stream': 'Annotations.stream' })
    .join('Namespaces', { 'Events.ns': 'Namespaces.id' })
    .where({ 'Events.db': uuid.toBuffer(db.id) })
    .andWhere('Events.stream', 'in', streams)
    .select('Events.stream as stream', 'Namespaces.name as ns', 'Annotations.annotation as annotation')
    .min('Events.ts', { as: 'first' })
    .max('Events.ts', { as: 'latest' })
    .count('*', { as: 'count' })
    .groupBy('Events.db', 'Events.ns', 'Events.stream')

  return results.map(row => {
    const annotation = JSON.parse(row.annotation)
    const stream = {
      id: uuid.fromBuffer(row.stream),
      ns: row.ns,
      created: row.first,
      modified: row.latest,
      size: row.count,
      annotation
    }
    if (annotation && annotation.type) stream.type = annotation.type
    return stream
  })
}

module.exports = async (toolbox, identity, options) => {
  if (options && options.db && options.ns) return await findStreamsForNamespace(toolbox, identity, options.db, options.ns)
  return await findStreamsForDatabase(toolbox, identity, options.db)
}
