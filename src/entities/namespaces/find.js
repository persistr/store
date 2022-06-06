const NamespaceNotFound = require('../../errors/NamespaceNotFound')
const NamespaceTaken = require('../../errors/NamespaceTaken')

const findNamespaceID = async (toolbox, identity, id, name) => {
  const { knex, store, uuid } = toolbox
  const results = await knex.select('id').from('Namespaces').where({ db: uuid.toBuffer(id), name })
  if (!results || !results[0] || !results[0].id) throw new NamespaceNotFound(name)
  return { id: uuid.fromBuffer(results[0].id), name, database: { id }}
}

const findOrCreateNamespaceID = async (toolbox, identity, dbName, dbID, name) => {
  const { knex, store, trycatch, uuid } = toolbox

  const results = await knex.select('id').from('Namespaces').where({ db: uuid.toBuffer(dbID), name })
  if (results && results[0] && results[0].id) {
    const nsID = uuid.fromBuffer(results[0].id)
    return { id: nsID, name, database: { id: dbID, name: dbName }}
  }

  const nsID = uuid.v4()
  let [error] = await trycatch(knex('Namespaces').insert({
    db: uuid.toBuffer(dbID),
    id: uuid.toBuffer(nsID),
    name
  }))
  if (error) throw new NamespaceTaken(name)

/*
  if (error && error.code === 'ER_DUP_ENTRY') throw new NamespaceTaken(name)
  if (error) throw error
*/

  return { id: nsID, name, database: { id: dbID, name: dbName }}
}

const findNamespaces = async (toolbox, identity, dbName) => {
  const { knex, uuid } = toolbox
  const results = await knex('Namespaces')
    .join('Databases', { 'Namespaces.db': 'Databases.id' })
    .where({ 'Databases.name': dbName })
    .select('Namespaces.name as name', 'Namespaces.id as id', 'Databases.id as idDB')
  return results.map(row => ({
    id: uuid.fromBuffer(row.id),
    name: row.name,
    database: {
      id: uuid.fromBuffer(row.idDB),
      name: dbName
    }
  }))
}

module.exports = async (toolbox, identity, options) => {
  if (options.db && options.dbID && (options.name || options.name === '')) return await findOrCreateNamespaceID(toolbox, identity, options.db, options.dbID, options.name)
  if (options.dbID && (options.name || options.name === '')) return await findNamespaceID(toolbox, identity, options.dbID, options.name)
  return await findNamespaces(toolbox, identity, options.db)
}
