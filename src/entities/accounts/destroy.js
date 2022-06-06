const AccountNotFound = require('../../errors/AccountNotFound')
module.exports = async (toolbox, identity, { username }) => {
  const { knex } = toolbox

  const account = await knex('Accounts').where({ username, isRoot: 0 }).first()
  if (!account) throw new AccountNotFound()

  const databases = knex.select('idDB').from('AccountDatabases').where('idAccount', account.id)
  await Promise.all([
    knex('Events').whereIn('db', databases).del(),
    knex('Annotations').whereIn('db', databases).del(),
    knex('Namespaces').whereIn('db', databases).del(),
    knex('Databases').whereIn('id', databases).del(),
    knex('AccountDatabases').where('idAccount', account.id).del(),
    knex('Accounts').where('id', account.id).del()
  ])
}
