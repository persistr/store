const methods = {
  $and: 'where',
  $or: 'orWhere'
}

const operators = {
  $ne: '<>',
  $lt: '<',
  $lte: '<=',
  $gt: '>',
  $gte: '>='
}

const isObject = (o) => Object.prototype.toString.call(o) === '[object Object]'

function queryByMethod (knex, key, value, knexMethodName) {
  if (!Array.isArray(value)) {
    throw new Error(`${key} expect an array value`)
  }

  knex.where(function () {
    value.forEach(item => queryToKnex(item, this, null, knexMethodName))
  })
}

const queryToKnex = (query, knex, parentKey, parentKnexMethodName) => {
  Object.keys(query).forEach((key) => {
    const value = query[key]

    if (isObject(value)) return queryToKnex(value, knex, key)

    const knexMethodName = methods[key]
    if (knexMethodName) return queryByMethod(knex, key, value, knexMethodName)

    const column = parentKey || key
    const operator = operators[key] || '='

    const methodName = parentKnexMethodName || 'where'
    return knex.whereJsonPath('data', `$.${column}`, operator, value)
  })
}

module.exports = (query, knex) => {
  return queryToKnex(query, knex)
}
