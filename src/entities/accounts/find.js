const AccountNotFound = require('../../errors/AccountNotFound')

const hydrate = async (toolbox, identity, account) => {
  const { knex, store, uuid } = toolbox

  const dbs = await knex('Accounts')
    .where({ 'Accounts.id': uuid.toBuffer(account.id) })
    .join('AccountDatabases', { 'Accounts.id': 'AccountDatabases.idAccount' })
    .join('Databases', { 'Databases.id': 'AccountDatabases.idDB' })
    .select('Databases.name as name', 'AccountDatabases.type as type')
    .orderBy('Databases.name')

  for (const db of dbs) {
    db.role = await store.roles.find(identity, { id: db.type })
  }

  return {
    id: account.id,
    name: account.name,
    username: account.username,
    isRoot: account.isRoot,
    key: account.key,
    dbs: dbs.map(db => ({ name: db.name, role: db.role }))
  }
}

const findAccount = async (toolbox, identity, username, password) => {
  const { crypto, knex, store, uuid } = toolbox

  const results = await knex.select('id', 'name', 'password', 'isRoot', 'key').from('Accounts').where({ username, isActive: 1 })
  if (!results || !results.length) throw new AccountNotFound()

  let accountPassword = results[0].password
  let verified = await crypto.passwords.verify({ password, against: accountPassword })
  if (!verified) throw new AccountNotFound()

  const account = {
    id: uuid.fromBuffer(results[0].id),
    name: results[0].name,
    username,
    isRoot: results[0].isRoot,
    key: results[0].key
  }

  return await hydrate(toolbox, identity, account)
}

const findAccountByID = async (toolbox, identity, id) => {
  const { knex, store, uuid } = toolbox

  const results = await knex.select('name', 'username', 'isRoot', 'key').from('Accounts').where({ id: uuid.toBuffer(id), isActive: 1 })
  if (!results || !results.length) throw new AccountNotFound()

  const account = {
    id,
    name: results[0].name,
    username: results[0].username,
    isRoot: results[0].isRoot,
    key: results[0].key
  }

  return await hydrate(toolbox, identity, account)
}

const findAccountByUsername = async (toolbox, identity, username) => {
  const { knex, store, uuid } = toolbox

  const results = await knex.select('id', 'name', 'isRoot', 'key').from('Accounts').where({ username, isActive: 1 })
  if (!results || !results.length) throw new AccountNotFound()

  const account = {
    id: uuid.fromBuffer(results[0].id),
    name: results[0].name,
    username,
    isRoot: results[0].isRoot,
    key: results[0].key
  }

  return await hydrate(toolbox, identity, account)
}

const findAccountByKey = async (toolbox, identity, id, key) => {
  const { knex, store, uuid } = toolbox

  const results = await knex.select('name', 'username', 'isRoot', 'key').from('Accounts').where({ id: uuid.toBuffer(id), key, isActive: 1 })
  if (!results || !results.length) throw new AccountNotFound()

  const account = {
    id,
    name: results[0].name,
    username: results[0].username,
    isRoot: results[0].isRoot,
    key: results[0].key
  }

  return await hydrate(toolbox, identity, account)
}

const findAccounts = async (toolbox, identity) => {
  const { knex, uuid } = toolbox
  const results = await knex.select('id', 'username', 'name', 'isActive', 'key').from('Accounts').where({ isRoot: 0 })
  return results.map(row => ({
    id: uuid.fromBuffer(row.id),
    name: row.name,
    username: row.username,
    isRoot: 0,
    isActive: row.isActive,
    key: row.key
  }))
}

module.exports = async (toolbox, identity, options) => {
  if (options && options.username && options.password) return await findAccount(toolbox, identity, options.username, options.password)
  if (options && options.username) return await findAccountByUsername(toolbox, identity, options.username)
  if (options && options.id && options.key) return await findAccountByKey(toolbox, identity, options.id, options.key)
  if (options && options.id) return await findAccountByID(toolbox, identity, options.id)
  return await findAccounts(toolbox, identity)
}
