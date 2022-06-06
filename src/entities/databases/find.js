const DatabaseNotFound = require('../../errors/DatabaseNotFound')

const findDatabaseByNameForAccount = async (toolbox, identity, name, account) => {
  const { knex, uuid } = toolbox
  const results = await knex('Databases')
    .join('AccountDatabases', { 'Databases.id': 'AccountDatabases.idDB' })
    .where({ 'AccountDatabases.idAccount': uuid.toBuffer(account) })
    .andWhere({ 'Databases.name': name })
    .select('Databases.id as id', 'AccountDatabases.idAccount as idAccount')
  if (!results || !results.length) throw new DatabaseNotFound(name)
  return { id: uuid.fromBuffer(results[0].id), name, account: { id: account }}
}

const findDatabaseByName = async (toolbox, identity, name) => {
  const { knex, uuid } = toolbox
  const results = await knex.select('id').from('Databases').where({ name })
  if (!results || !results.length) throw new DatabaseNotFound(name)
  return { id: uuid.fromBuffer(results[0].id), name }
}

const findDatabasesForAccount = async (toolbox, identity, account) => {
  const { knex, uuid } = toolbox
  const results = await knex('Databases')
    .join('AccountDatabases', { 'Databases.id': 'AccountDatabases.idDB' })
    .where({ 'AccountDatabases.idAccount': uuid.toBuffer(account) })
    .select('Databases.name as name', 'Databases.id as id')
  return results.map(row => ({
    id: uuid.fromBuffer(row.id),
    name: row.name
  }))
}

module.exports = async (toolbox, identity, options) => {
  if (options && options.name && options.account) return await findDatabaseByNameForAccount(toolbox, identity, options.name, options.account)
  if (options && options.name) return await findDatabaseByName(toolbox, identity, options.name)
  return await findDatabasesForAccount(toolbox, identity, options.account)
}
