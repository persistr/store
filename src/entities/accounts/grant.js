module.exports = async (toolbox, identity, { db: dbName, role, username, account: accountID }) => {
  const { knex, store, trycatch, uuid } = toolbox

  const db = await store.databases.find(identity, { name: dbName, account: accountID })
  const roleID = await store.roles.find(identity, { name: role })
  const account = await store.accounts.find(identity, { username })

  const relation = {
    idDB: uuid.toBuffer(db.id),
    idAccount: uuid.toBuffer(account.id),
    type: roleID
  }
  await knex('AccountDatabases').insert(relation).onConflict(['idDB', 'idAccount']).merge()
}
