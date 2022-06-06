const UsernameTaken = require('../../errors/UsernameTaken')
module.exports = async (toolbox, identity, { username, name, password }) => {
  const { crypto, knex, trycatch, uuid } = toolbox

  const accountID = uuid.v4()
  const hashedPassword = await crypto.passwords.hash(password)
  const key = await crypto.keys.generate(accountID)

  let [error] = await trycatch(knex('Accounts').insert({ id: uuid.toBuffer(accountID), username, name, password: hashedPassword, key, isActive: 1, isRoot: 0 }))
  if (error) throw new UsernameTaken(username)

  return { id: accountID, name, username, dbs: [], key }
}
