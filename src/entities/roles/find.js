const RoleNotFound = require('../../errors/RoleNotFound')

const findRoleID = async (toolbox, identity, name) => {
  const roles = { owner: 1, admin: 2, member: 3, reader: 4 }
  const id = roles[name]
  if (!id) throw new RoleNotFound(name)
  return id
}

const findRoleName = async (toolbox, identity, id) => {
  const roles = { 1: 'owner', 2: 'admin', 3: 'member', 4: 'reader' }
  const name = roles[id]
  if (!name) throw new RoleNotFound(id)
  return name
}

module.exports = async (toolbox, identity, options) => {
  if (options.name) return await findRoleID(toolbox, identity, options.name)
  return await findRoleName(toolbox, identity, options.id)
}
