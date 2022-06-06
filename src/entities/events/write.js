const { DateTime } = require('luxon')
const matcher = require('matcher')
const DuplicateEvent = require('../../errors/DuplicateEvent')
module.exports = async (toolbox, identity, event) => {
  const { knex, store, trycatch, uuid } = toolbox

  event.data = event.data || {}
  event.meta = Object.assign({ id: uuid.v4(), tz: DateTime.local().zoneName }, event.meta, {
    ts: DateTime.utc().toISO()
  })

  const db = await store.databases.find(identity, { name: event.meta.db })
  const ns = await store.namespaces.find(identity, { db: event.meta.db, dbID: db.id, name: event.meta.ns })

  const entity = {
    id: uuid.toBuffer(event.meta.id),
    type: event.meta.type,
    ts: DateTime.fromISO(event.meta.ts).toUTC().toSQL({ includeOffset: false }),
    db: uuid.toBuffer(db.id),
    ns: uuid.toBuffer(ns.id),
    stream: uuid.toBuffer(event.meta.stream),
    meta: JSON.stringify(event.meta),
    data: JSON.stringify(event.data)
  }
  let [error] = await trycatch(knex('Events').insert(entity))
  if (error) throw new DuplicateEvent(event.meta.id)

  for (let i = 0; i < store.events?.subscriptions?.length; i++) {
    const subscription = store.events.subscriptions[i]
    const { search, query, callback } = subscription

    let events = [ event ]

    // Filter events by database, namespace, and stream.
    const { db, ns, stream, types, limit, each } = query
    events = events.filter(event => 
      (event.meta.db === db) && 
      (event.meta.ns === ns || !ns) && 
      (event.meta.stream === stream || !stream))

    // Filter events by type.
    if (types) {
      events = events.filter(event => types.some(type => matcher.isMatch(event.meta.type, type)))
    }

    // Limit the number of returned events.
    if (search.limit) {
      events.length = Math.min(search.count + events.length, search.limit) - search.count
    }

    for (const event of events) {
      await callback(event, { cancel: () => { search.cancelled = true }})
    }

    search.count += events.length

    if (search.limit && search.count >= search.limit) {
      store.events.unsubscribe(identity, subscription.id)
    }
  }

  return event
}
