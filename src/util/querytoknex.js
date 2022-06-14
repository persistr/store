const methods = {
  $and: 'where',
  $or: 'orWhere'
}

const operators = {
  $ne: '<>',
  $lt: '<',
  $lte: '<=',
  $gt: '>',
  $gte: '>=',
  $regex: 'like'
}

const regexChars = [
  '^',
  '[',
  ']',
  '-',
  '$',
  '(',
  ')',
  '{',
  '}',
  '|',
  '?',
  '+',
  '!',
  '\\',
]

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
  Object.keys(query || {}).forEach((key) => {
    let value = query[key]

    if (isObject(value)) return queryToKnex(value, knex, key)

    const knexMethodName = methods[key]
    if (knexMethodName) return queryByMethod(knex, key, value, knexMethodName)

    const column = parentKey || key
    const operator = operators[key] || '='

    if(operator === 'like'){
      const isLikeCompatible = regexChars.every(char=>!value.includes(char))
      if(isLikeCompatible){
        value = value.replaceAll('*','%').replaceAll('.','_')
      } else {
        console.warn(`Regex filter for column ${column} with value of ${value} is not SQL LIKE compatible!`)
        return
      }
    }
    const methodName = parentKnexMethodName || 'where'
    return knex[`${methodName}JsonPath`]('data', `$.${column}`, operator, value)
  })
}

module.exports = (query, knex) => {
  return queryToKnex(query, knex)
}
