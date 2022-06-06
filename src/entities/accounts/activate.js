const AccountNotFound = require('../../errors/AccountNotFound')
module.exports = async (toolbox, identity, { username }) => {
  const { knex } = toolbox
  const results = await knex('Accounts').where({ username, isRoot: 0 }).count('username', { as: 'count' })
  if (!results || !results.length || !results[0].count) throw new AccountNotFound()
  await knex('Accounts').where({ username, isRoot: 0 }).update({ isActive: 1 })
}
