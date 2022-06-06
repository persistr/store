module.exports = async (toolbox, identity, { db: dbName, username, account: accountID }) => {
  const { knex, store, trycatch, uuid } = toolbox
  const db = await store.databases.find(identity, { name: dbName, account: accountID })
  const account = await store.accounts.find(identity, { username })
  await knex('AccountDatabases').where({ idDB: uuid.toBuffer(db.id), idAccount: uuid.toBuffer(account.id) }).del()
}
