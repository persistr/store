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

const forbidden = '^[]-$(){}|?+!\\'.split('')

const isObject = (o) => Object.prototype.toString.call(o) === '[object Object]'

function queryByMethod (knex, key, value, knexMethodName) {
  if (!Array.isArray(value)) {
    throw new Error(`${key} expect an array value`)
  }

  const regexs = []
  knex.where(function () {
    value.forEach(item => {
      const regex = queryToKnex({ query: item, knex: this, parentKey: null, parentKnexMethodName: knexMethodName })
      if (regex && regex.length > 0) regexs = [ ...regexs, ...regex ]
    })
  })
  return regexs
}

const queryToKnex = ({ query, knex, parentKey, parentKnexMethodName, options }) => {
  for (const key of Object.keys(query || {})) {
    let value = query[key]

    if (isObject(value)) return queryToKnex({ query: value, knex, parentKey: key, parentKnexMethodName })

    const knexMethodName = methods[key]
    if (knexMethodName) return queryByMethod(knex, key, value, knexMethodName)

    const column = parentKey || key
    const operator = operators[key] || '='

    if (operator === 'like') {
      const regex = value
      value = value.replaceAll('.*', '%').replaceAll('.+', '_%')
      const isLikeCompatible = forbidden.every(char => !value.includes(char))
      if (isLikeCompatible) {
        value = value.replaceAll('.', '_')
      } else {
        // Regex filter for column ${column} with value of ${value} is not SQL LIKE compatible!
        if (options?.strict) throw new Error(`Regex filter for column ${column} with value of ${regex} is not SQL LIKE compatible!`)
        return [{ column, regex }]
      }
    }

    const methodName = parentKnexMethodName || 'where'
    knex[`${methodName}JsonPath`]('data', `$.${column}`, operator, value)
  }
}

module.exports = (query, knex, options) => {
  const regexs = queryToKnex({ query, knex, options })
  return (results) => {
    if (!regexs || !regexs.length) return results
    return results.filter(result => regexs.some(re => new RegExp(re.regex).test(result[re.column])))
  }
}
