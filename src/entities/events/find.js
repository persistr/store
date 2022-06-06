const EventNotFound = require('../../errors/EventNotFound')
const { DateTime } = require('luxon')
const wildcards = require('wildcards-to-mysql')

const findPastEvents = async (toolbox, identity, { db: dbName, ns, stream, types, from, to, after, until, limit, schema }) => {
  const { knex, store, uuid } = toolbox

  let options = {}

  let domainSearch = false
  if (!stream) domainSearch = true

  let streamScope = true
  if (!stream) streamScope = false

  if (limit) options.limit = limit = Math.min(50, limit)

  const db = await store.databases.find(identity, { name: dbName })
  let query = knex.select('*').from('Events').where({ db: uuid.toBuffer(db.id) })
  options.dbID = uuid.toBuffer(db.id)

  let domainID
  if (ns !== undefined) {
    try {
      const namespace = await store.namespaces.find(identity, { dbID: db.id, name: ns })
      domainID = namespace.id
    }
    catch (error) {
      return []
    }
    query.andWhere({ ns: uuid.toBuffer(domainID) })
    options.domainID = uuid.toBuffer(domainID)
  }

  if (stream) {
    query.andWhere({ stream: uuid.toBuffer(stream) })
    options.streamID = uuid.toBuffer(stream)
  }

  if (from) {
    let dt = DateTime.fromISO(decodeURIComponent(from), { setZone: true })
    if (dt.isValid) {
      query.andWhere('ts', '>=', dt.toSQL({ includeOffset: false }))
      options.from = dt.toSQL({ includeOffset: false })
    }
    else {
      if (!stream) {
        let tokens = from.split('.')
        from = tokens.pop()
        stream = tokens.pop()
      }

      const subquery = { db: uuid.toBuffer(db.id), stream: uuid.toBuffer(stream), id: uuid.toBuffer(from) }
      if (domainID) subquery.ns = uuid.toBuffer(domainID)
      const results = await knex.select('ts').from('Events').where(subquery)
      if (!results || !results[0] || !results[0].ts) throw new EventNotFound(dbName, ns, stream, from)

      const ts = results[0].ts
      query.andWhere('ts', '>=', ts)
      options.from = ts
    }
  }

  if (after) {
    let dt = DateTime.fromISO(decodeURIComponent(after), { setZone: true })
    if (dt.isValid) {
      query.andWhere('ts', '>', dt.toSQL({ includeOffset: false }))
      options.after = dt.toSQL({ includeOffset: false })
    }
    else {
      if (!stream) {
        let tokens = after.split('.')
        after = tokens.pop()
        stream = tokens.pop()
      }

      const subquery = { db: uuid.toBuffer(db.id), stream: uuid.toBuffer(stream), id: uuid.toBuffer(after) }
      if (domainID) subquery.ns = uuid.toBuffer(domainID)
      const results = await knex.select('ts', 'meta').from('Events').where(subquery)
      if (!results || !results[0] || !results[0].ts) throw new EventNotFound(dbName, ns, stream, after)

      const ts = results[0].ts
      query.andWhere('ts', '>', ts)
      options.after = DateTime.fromISO(JSON.parse(results[0].meta).ts, { setZone: true })
    }
  }

  if (to) {
    let dt = DateTime.fromISO(decodeURIComponent(to), { setZone: true })
    if (dt.isValid) {
      query.andWhere('ts', '<=', dt.toSQL({ includeOffset: false }))
      options.to = dt.toSQL({ includeOffset: false })
    }
    else {
      if (!stream) {
        let tokens = to.split('.')
        to = tokens.pop()
        stream = tokens.pop()
      }

      const subquery = { db: uuid.toBuffer(db.id), stream: uuid.toBuffer(stream), id: uuid.toBuffer(to) }
      if (domainID) subquery.ns = uuid.toBuffer(domainID)
      const results = await knex.select('ts').from('Events').where(subquery)
      if (!results || !results[0] || !results[0].ts) throw new EventNotFound(dbName, ns, stream, to)

      const ts = results[0].ts
      query.andWhere('ts', '<=', ts)
      options.to = ts
    }
  }

  if (until && until !== 'caught-up') {
    let dt = DateTime.fromISO(decodeURIComponent(until), { setZone: true })
    if (dt.isValid) {
      query.andWhere('ts', '<', dt.toSQL({ includeOffset: false }))
      options.until = dt.toSQL({ includeOffset: false })
    }
    else {
      if (!stream) {
        let tokens = until.split('.')
        until = tokens.pop()
        stream = tokens.pop()
      }

      const subquery = { db: uuid.toBuffer(db.id), stream: uuid.toBuffer(stream), id: uuid.toBuffer(until) }
      if (domainID) subquery.ns = uuid.toBuffer(domainID)
      const results = await knex.select('ts').from('Events').where(subquery)
      if (!results || !results[0] || !results[0].ts) throw new EventNotFound(dbName, ns, stream, until)

      const ts = results[0].ts
      query.andWhere('ts', '<', ts)
      options.until = ts
    }
  }

  if (stream) streamScope = true

  if (types) {
/* Avoid MySQL full text search due to this bug: FTS query exceeds result cache limit
 https://bugs.mysql.com/bug.php?id=80296
*/

    // Build a query that doesn't use full text search.
    let list = Array.isArray(types) ? types : [types]
    query.andWhere(function() {
      for (let i = 0; i < list.length; i++) {
        const type = list[i]
        if (i == 0) {
          this.where('type', wildcards.toMysqlOperator(type), wildcards.toMysqlLike(type))
        }
        else {
          this.orWhere('type', wildcards.toMysqlOperator(type), wildcards.toMysqlLike(type))
        }
      }
    })
  }

  query.orderBy('ts', 'asc')
  if (limit) query.limit(limit)

  // Run the query.
  let rows = await query

  // Hydrate events from query results.
  const events = []
  for (const row of rows) {
    let event = { data: JSON.parse(row.data), meta: JSON.parse(row.meta) }
    events.push(event)
  }

  return events
}

const findEvents = async (toolbox, identity, query) => {
  const { knex, store, uuid } = toolbox

  let subscriptionID = undefined
  const search = {
    count: 0,
    limit: query.limit,
    cancelled: false,
  }

  if (query.cancellation) query.cancellation.cancel = () => {
    search.cancelled = true
    if (subscriptionID) store.events.unsubscribe(identity, subscriptionID)
  }

  // Find all past events that match the given query.
  do {
    // Find matching events and process them.
    const events = await findPastEvents(toolbox, identity, query)
    for (const event of events) {
      if (search.cancelled) break
      if (!event.meta || !event.meta.id) continue
      await query.callback(event, { cancel: () => { search.cancelled = true }})
      search.count = search.count + 1
    }

    // Repeat the search until no more results.
    query.after = undefined
    if (events.length) {
      query.after = events[events.length - 1].meta.id
      if (!query.stream) query.after = `${events[events.length - 1].meta.stream}.${query.after}`
    }
  }
  while (query.after && !search.cancelled && (!search.limit || search.count < search.limit))

  const callback = async event => {
    await query.callback(event, { cancel: () => {
      search.cancelled = true
      if (subscriptionID) store.events.unsubscribe(identity, subscriptionID)
    }})
  }
  if (!search.cancelled && !query.to && !query.until && (!search.limit || search.count < search.limit)) {
    subscriptionID = await store.events.subscribe(identity, { search, query, callback })
  }
}

module.exports = async (toolbox, identity, options) => {
  if (options.callback) return await findEvents(toolbox, identity, options)
  return await findPastEvents(toolbox, identity, options)
}
