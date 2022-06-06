const DatabaseTaken = require('../../errors/DatabaseTaken')
module.exports = async (toolbox, identity, { name, account: accountID }) => {
  const { knex, trycatch, uuid } = toolbox

  const dbID = uuid.v4()
  let [error] = await trycatch(knex('Databases').insert({ id: uuid.toBuffer(dbID), name }))
  if (error) throw new DatabaseTaken(name)

  await knex('AccountDatabases').insert({ idDB: uuid.toBuffer(dbID), idAccount: uuid.toBuffer(accountID), type: 1 })

  return { id: dbID, name, account: { id: accountID }}
}
