const { Given, When, Then } = require('@cucumber/cucumber')
const assert = require('assert')
const JSON5 = require('json5')

const AccountNotFound = require('../../src/errors/AccountNotFound')
const AnnotationNotFound = require('../../src/errors/AnnotationNotFound')
const DatabaseNotFound = require('../../src/errors/DatabaseNotFound')
const DatabaseTaken = require('../../src/errors/DatabaseTaken')
const DocumentNotFound = require('../../src/errors/DocumentNotFound')
const DuplicateEvent = require('../../src/errors/DuplicateEvent')
const EventNotFound = require('../../src/errors/EventNotFound')
const NamespaceNotFound = require('../../src/errors/NamespaceNotFound')
const NamespaceTaken = require('../../src/errors/NamespaceTaken')
const ObjectNotFound = require('../../src/errors/ObjectNotFound')
const StreamNotFound = require('../../src/errors/StreamNotFound')
const UsernameTaken = require('../../src/errors/UsernameTaken')

const clear = async knex => {
  await Promise.all([
    knex('AccountDatabases').truncate(),
    knex('Accounts').truncate(),
    knex('Annotations').truncate(),
    knex('Databases').truncate(),
    knex('Events').truncate(),
    knex('Namespaces').truncate(),
    knex('Objects').truncate(),
    knex('Streams').truncate()
  ])
}

Given('an empty database', async function () {
  clear(this.knex)
})

//
// Accounts
//

Given('a demo account', async function () {
  clear(this.knex)

  const account = await this.store.accounts.create({ username: 'demo', name: 'Demo Account', password: 'demo1234' })
  assert.match(account.id, /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i)
  assert.equal(account.username, 'demo')
  assert.equal(account.name, 'Demo Account')
  assert.equal(account.dbs.length, 0)

  this.account = account
})

When('I create an account with {string}, {string}, and {string}', async function (username, name, password) {
  try {
    const account = await this.store.accounts.create({ username, name, password })
    assert.match(account.id, /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i)
    assert.equal(account.username, username)
    assert.equal(account.name, name)
    assert.equal(account.dbs.length, 0)
  }
  catch (error) {
    this.error = error
  }
})

When('I destroy account {string}', async function (username) {
  try {
    await this.store.accounts.destroy({ username })
  }
  catch (error) {
    this.error = error
  }
})

When('I deactivate account {string}', async function (username) {
  try {
    await this.store.accounts.deactivate({ username })
  }
  catch (error) {
    this.error = error
  }
})

When('I reactivate account {string}', async function (username) {
  try {
    await this.store.accounts.activate({ username })
  }
  catch (error) {
    this.error = error
  }
})

When('I grant {string} access to database {string} for account {string}', async function (role, db, username) {
  await this.store.accounts.grant({ db, role, username, account: this.account.id })
})

When('I revoke access to database {string} for account {string}', async function (db, username) {
  await this.store.accounts.revoke({ db, username, account: this.account.id })
})

Then('I can confirm that there are {int} accounts available', async function (count) {
  const accounts = await this.store.accounts.find()
  assert.equal(accounts.length, count)
  for (const account of accounts) {
    assert.match(account.id, /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i)
    assert(account.username !== '')
    assert(account.name !== '')
  }
})

Then('I can confirm that account exists with {string}, {string}, and {string}', async function (username, name, password) {
  const account = await this.store.accounts.find({ username, password })
  assert.match(account.id, /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i)
  assert.equal(account.username, username)
  assert.equal(account.name, name)
  assert.equal(account.dbs.length, 0)

  const account2 = await this.store.accounts.find({ id: account.id })
  assert.equal(account2.id, account.id)
  assert.equal(account2.username, username)
  assert.equal(account2.name, name)
  assert.equal(account2.dbs.length, 0)
})

Then('I can confirm that account {string} is retrievable via its API key', async function (username) {
  const account = await this.store.accounts.find({ username })
  assert.match(account.id, /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i)
  assert.equal(account.username, username)

  const account2 = await this.store.accounts.find({ id: account.id, key: account.key })
  assert.equal(account2.id, account.id)
  assert.equal(account2.username, username)
  assert.equal(account2.name, account.name)
})

Then('I can confirm that account {string} is retrievable via its unique ID', async function (username) {
  const account = await this.store.accounts.find({ username })
  assert.match(account.id, /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i)
  assert.equal(account.username, username)

  const account2 = await this.store.accounts.find({ id: account.id })
  assert.equal(account2.id, account.id)
  assert.equal(account2.username, username)
  assert.equal(account2.name, account.name)
})

Then("I can't find an active account with {string}", async function (username) {
  let exists = true
  try {
    const account = await this.store.accounts.find({ username })
  }
  catch (error) {
    if (error instanceof AccountNotFound) {
      exists = false
    }
  }
  assert.equal(exists, false)
})

Then("I can't find account with ID {string}", async function (id) {
  let exists = true
  try {
    const account = await this.store.accounts.find({ id })
  }
  catch (error) {
    if (error instanceof AccountNotFound) {
      exists = false
    }
  }
  assert.equal(exists, false)
})

Then("I can't find account {string} with API key {string}", async function (username, key) {
  const account = await this.store.accounts.find({ username })
  let exists = true
  try {
    const account2 = await this.store.accounts.find({ id: account.id, key })
  }
  catch (error) {
    if (error instanceof AccountNotFound) {
      exists = false
    }
  }
  assert.equal(exists, false)
})

Then("I can't find account {string} with password {string}", async function (username, password) {
  let exists = true
  try {
    const account = await this.store.accounts.find({ username, password })
  }
  catch (error) {
    if (error instanceof AccountNotFound) {
      exists = false
    }
  }
  assert.equal(exists, false)
})

Then('I can confirm that account {string} has {string} access to database {string}', async function (username, role, db) {
  const account = await this.store.accounts.find({ username })
  assert.match(account.id, /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i)
  assert.equal(account.username, username)
  assert(account.dbs.length >= 1)
  let found = false
  for (const database of account.dbs) {
    if (database.name === db && database.role === role) {
      found = true
      break
    }
  }
  assert(found)

  const account2 = await this.store.accounts.find({ id: account.id })
  assert.equal(account2.id, account.id)
  assert.equal(account2.username, username)
  assert.equal(account2.name, account.name)
  assert(account2.dbs.length >= 1)
  found = false
  for (const database of account2.dbs) {
    if (database.name === db && database.role === role) {
      found = true
      break
    }
  }
  assert(found)
})

Then('I can confirm that account {string} does NOT have access to database {string}', async function (username, db) {
  const account = await this.store.accounts.find({ username })
  assert.match(account.id, /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i)
  assert.equal(account.username, username)
  let found = false
  for (const database of account.dbs) {
    if (database.name === db) {
      found = true
      break
    }
  }
  assert(!found)

  const account2 = await this.store.accounts.find({ id: account.id })
  assert.equal(account2.id, account.id)
  assert.equal(account2.username, username)
  assert.equal(account2.name, account.name)
  found = false
  for (const database of account2.dbs) {
    if (database.name === db) {
      found = true
      break
    }
  }
  assert(!found)
})

Then('I can confirm that account {string} is not a root account', async function (username) {
  try {
    const account = await this.store.accounts.find({ username })
    assert.match(account.id, /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i)
    assert.equal(account.username, username)
    assert(!account.isRoot)
  }
  catch (error) {
    this.error = error
  }
})

Then('I get an account not found error', async function () {
  assert(this.error instanceof AccountNotFound)
  this.error = undefined
})

Then('I get a username taken error', async function () {
  assert(this.error instanceof UsernameTaken)
  this.error = undefined
})

//
// Databases
//

Given('a demo database', async function () {
  clear(this.knex)

  const account = await this.store.accounts.create({ username: 'demo', name: 'Demo Account', password: 'demo1234' })
  assert.match(account.id, /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i)
  assert.equal(account.username, 'demo')
  assert.equal(account.name, 'Demo Account')
  assert.equal(account.dbs.length, 0)
  this.account = account

  const database = await this.store.databases.create({ name: 'demo', account: this.account.id })
  assert.match(database.id, /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i)
  assert.equal(database.name, 'demo')
  assert.equal(database.account.id, this.account.id)
  this.database = database
})

When('I create database {string}', async function (database) {
  try {
    const db = await this.store.databases.create({ name: database, account: this.account.id })
  }
  catch (error) {
    this.error = error
  }
})

When('I destroy database {string}', async function (database) {
  await this.store.databases.destroy({ name: database, account: this.account.id })
})

When('I rename database {string} to {string}', async function (oldName, newName) {
  try {
    await this.store.databases.rename({ name: oldName, to: newName, account: this.account.id })
  }
  catch (error) {
    this.error = error
  }
})

Then('I can confirm that there are {int} databases available', async function (count) {
  const databases = await this.store.databases.find({ account: this.account.id })
  assert.equal(databases.length, count)
  for (const db of databases) {
    assert.match(db.id, /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i)
    assert(db.name !== '')
  }
})

Then('I can confirm that database {string} exists', async function (database) {
  const db = await this.store.databases.find({ name: database, account: this.account.id })
  assert.match(db.id, /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i)

  const db2 = await this.store.databases.find({ name: database })
  assert.match(db2.id, /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i)
  assert.equal(db.id, db2.id)
})

Then("I can't find database {string}", async function (database) {
  let exists = true
  try {
    const db = await this.store.databases.find({ name: database, account: this.account.id })
  }
  catch (error) {
    if (error instanceof DatabaseNotFound) {
      exists = false
    }
  }
  assert.equal(exists, false)

  exists = true
  try {
    const db = await this.store.databases.find({ name: database })
  }
  catch (error) {
    if (error instanceof DatabaseNotFound) {
      exists = false
    }
  }
  assert.equal(exists, false)
})

Then('I get a database not found error', async function () {
  assert(this.error instanceof DatabaseNotFound)
  this.error = undefined
})

Then('I get a duplicate database error', async function () {
  assert(this.error instanceof DatabaseTaken)
  this.error = undefined
})

//
// Namespaces
//

Given('a demo namespace', async function () {
  clear(this.knex)

  const account = await this.store.accounts.create({ username: 'demo', name: 'Demo Account', password: 'demo1234' })
  assert.match(account.id, /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i)
  assert.equal(account.username, 'demo')
  assert.equal(account.name, 'Demo Account')
  assert.equal(account.dbs.length, 0)
  this.account = account

  const database = await this.store.databases.create({ name: 'demo', account: this.account.id })
  assert.match(database.id, /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i)
  assert.equal(database.name, 'demo')
  assert.equal(database.account.id, this.account.id)
  this.database = database

  const namespace = await this.store.namespaces.create({ name: 'demo', db: 'demo', account: this.account.id })
  assert.match(namespace.id, /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i)
  assert.equal(namespace.name, 'demo')
  assert.equal(namespace.account.id, this.account.id)
  this.namespace = namespace
})

Given('default namespace', async function () {
  this.namespace = { name: '' }
})

When('I create namespace {string}', async function (name) {
  try {
    const namespace = await this.store.namespaces.create({ name: name, db: this.database.name, account: this.account.id })
  }
  catch (error) {
    this.error = error
  }
})

When('I destroy namespace {string}', async function (name) {
  await this.store.namespaces.destroy({ name, db: this.database.name, account: this.account.id })
})

When('I rename namespace {string} to {string}', async function (oldName, newName) {
  try {
    await this.store.namespaces.rename({ db: this.database.name, name: oldName, to: newName, account: this.account.id })
  }
  catch (error) {
    this.error = error
  }
})

When('I truncate namespace {string}', async function (name) {
  await this.store.namespaces.truncate({ name, db: this.database.name, account: this.account.id })
})

Then('I can confirm that there are {int} namespaces available', async function (count) {
  const namespaces = await this.store.namespaces.find({ db: this.database.name })
  assert.equal(namespaces.length, count)
  for (const ns of namespaces) {
    assert.match(ns.id, /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i)
    assert(ns.name !== '')
    assert.equal(ns.database.id, this.database.id)
    assert.equal(ns.database.name, this.database.name)
  }
})

Then('I can confirm that namespace {string} exists', async function (name) {
  const ns = await this.store.namespaces.find({ name, dbID: this.database.id })
  assert.match(ns.id, /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i)
  assert.equal(ns.name, name)
})

Then("I can't find namespace {string}", async function (name) {
  let exists = true
  try {
    const ns = await this.store.namespaces.find({ name, dbID: this.database.id })
  }
  catch (error) {
    if (error instanceof NamespaceNotFound) {
      exists = false
    }
  }
  assert.equal(exists, false)
})

Then('I get a namespace not found error', async function () {
  assert(this.error instanceof NamespaceNotFound)
  this.error = undefined
})

Then('I get a duplicate namespace error', async function () {
  assert(this.error instanceof NamespaceTaken)
  this.error = undefined
})

//
// Objects
//

When('I write object {string} with ID {string}', async function (content, id) {
  await this.store.objects.write({ db: this.database.name, id, data: toObject(content) })
})

When('I try to read content of object {string}', async function (id) {
  const object = await this.store.objects.read({ db: this.database.name, id })
  if (!object) this.error = new ObjectNotFound()
})

When('I destroy object {string}', async function (id) {
  await this.store.objects.destroy({ db: this.database.name, id })
})

When('I try to destroy object {string}', async function (id) {
  try {
    await this.store.objects.destroy({ db: this.database.name, id })
  }
  catch (error) {
    this.error = error
  }
})

Then('I can confirm that object {string} exists', async function (id) {
  const object = await this.store.objects.read({ db: this.database.name, id })
  assert(object)
})

Then('I can confirm that content of object {string} is {string}', async function (id, content) {
  const object = await this.store.objects.read({ db: this.database.name, id })
  assert.deepStrictEqual(object, toObject(content))
})

Then("I can't find object {string}", async function (id) {
  const object = await this.store.objects.read({ db: this.database.name, id })
  assert.equal(object, null)
})

Then('I get an object not found error', async function () {
  assert(this.error instanceof ObjectNotFound)
  this.error = undefined
})

//
// Streams
//

Given('stream with ID {string}', async function (stream) {
  this.stream = stream
})

Given('a demo stream', async function () {
  clear(this.knex)

  const account = await this.store.accounts.create({ username: 'demo', name: 'Demo Account', password: 'demo1234' })
  assert.match(account.id, /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i)
  assert.equal(account.username, 'demo')
  assert.equal(account.name, 'Demo Account')
  assert.equal(account.dbs.length, 0)
  this.account = account

  const database = await this.store.databases.create({ name: 'demo', account: this.account.id })
  assert.match(database.id, /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i)
  assert.equal(database.name, 'demo')
  assert.equal(database.account.id, this.account.id)
  this.database = database

  const namespace = await this.store.namespaces.create({ name: 'demo', db: 'demo', account: this.account.id })
  assert.match(namespace.id, /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i)
  assert.equal(namespace.name, 'demo')
  assert.equal(namespace.account.id, this.account.id)
  this.namespace = namespace

  this.stream = 'ac9a0d2c-619f-47f8-8510-52429f4f0680'

  const event = { data: { hello: 'world' }, meta: { id: '26d4211d-1df4-468f-af24-96cc9e9a2e27', type: 'test', stream: this.stream, db: this.database.name, ns: this.namespace.name }}
  await this.store.events.write(event)
})

When('I try to read stream {string}', async function (id) {
  try {
    const stream = await this.store.streams.read({ db: this.database.name, ns: this.namespace.name, id })
  }
  catch (error) {
    this.error = error
  }
})

When('I destroy stream {string}', async function (id) {
  await this.store.streams.destroy({ db: this.database.name, ns: this.namespace.name, id, account: this.account.id })
})

When('I try to destroy stream {string}', async function (id) {
  try {
    await this.store.streams.destroy({ db: this.database.name, ns: this.namespace.name, id, account: this.account.id })
  }
  catch (error) {
    this.error = error
  }
})

Then('I can confirm that there are {int} streams available', async function (count) {
  const streams = await this.store.streams.find({ db: this.database.name })
  assert.equal(streams.length, count)
  for (const stream of streams) {
    assert.match(stream.id, /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i)
    assert(stream.ns || stream.ns === '')
    assert(stream.created)
    assert(stream.modified)
    assert(stream.size >= 1)
  }

  const streams2 = await this.store.streams.find({ db: this.database.name, ns: this.namespace.name })
  assert.equal(streams2.length, count)
  assert.deepStrictEqual(streams, streams2)
})

Then('I can confirm that stream {string} exists', async function (id) {
  const stream = await this.store.streams.read({ db: this.database.name, ns: this.namespace.name, id })
  assert(stream)
  assert.equal(stream.id, id)
  assert.equal(stream.ns, this.namespace.name)
  assert(stream.created)
  assert(stream.modified)
  assert(stream.size >= 1)
})

Then('I can confirm that stream type is undefined', async function () {
  const stream = await this.store.streams.read({ db: this.database.name, ns: this.namespace.name, id: this.stream })
  assert(stream)
  assert(stream.type === undefined)
})

Then('I can confirm that stream type is {string}', async function (type) {
  const stream = await this.store.streams.read({ db: this.database.name, ns: this.namespace.name, id: this.stream })
  assert(stream)
  assert.equal(stream.type, type)
})

Then('I get a stream not found error', async function () {
  assert(this.error instanceof StreamNotFound)
  this.error = undefined
})

//
// Events
//

When('I write event {string} with ID {string} and type {string} to stream {string} in namespace {string}', async function (content, id, type, stream, ns) {
  const event = { data: toObject(content), meta: { id, type, stream, db: this.database.name, ns }}
  await this.store.events.write(event)
})

When('I write event {string} with ID {string} and type {string} to stream {string}', async function (content, id, type, stream) {
  const event = { data: toObject(content), meta: { id, type, stream, db: this.database.name, ns: this?.namespace?.name ?? '' }}
  await this.store.events.write(event)
})

When('I write event {string} with ID {string} and type {string}', async function (content, id, type) {
  const event = { data: toObject(content), meta: { id, type, stream: this.stream, db: this.database.name, ns: this?.namespace?.name ?? '' }}
  await this.store.events.write(event)
})

When('I try to write event {string} with ID {string} and type {string}', async function (content, id, type) {
  try {
    const event = { data: toObject(content), meta: { id, type, stream: this.stream, db: this.database.name, ns: this?.namespace?.name ?? '' }}
    await this.store.events.write(event)
  }
  catch (error) {
    this.error = error
  }
})

When('I write event with ID {string} and type {string}', async function (id, type) {
  const event = { meta: { id, type, stream: this.stream, db: this.database.name, ns: this?.namespace?.name ?? '' }}
  await this.store.events.write(event)
})

When('I try to read content of event with ID {string}', async function (id) {
  try {
    const event = await this.store.events.read({ db: this.database.name, ns: this.namespace.name, stream: this.stream, event: id })
  }
  catch (error) {
    this.error = error
  }
})

When('I destroy event with ID {string}', async function (id) {
  await this.store.events.destroy({ db: this.database.name, ns: this.namespace.name, stream: this.stream, event: id })
})

When('I try to destroy event with ID {string}', async function (id) {
  try {
    await this.store.events.destroy({ db: this.database.name, ns: this.namespace.name, stream: this.stream, event: id })
  }
  catch (error) {
    this.error = error
  }
})

When('I search for events after event with ID {string}', async function (id) {
  const event = await this.store.events.read({ db: this.database.name, ns: this.namespace.name, stream: this.stream, event: id })
  assert(event)
  const events = await this.store.events.find({ db: this.database.name, ns: this.namespace.name, stream: this.stream, after: event.meta.ts })
  const events2 = await this.store.events.find({ db: this.database.name, ns: this.namespace.name, stream: this.stream, after: event.meta.id })
  assert.deepStrictEqual(events, events2)
  const events3 = await this.store.events.find({ db: this.database.name, ns: this.namespace.name, after: `${this.stream}.${event.meta.id}` })
  assert.deepStrictEqual(events, events3)
  this.events = events
})

When('I try to search for events after event with ID {string}', async function (id) {
  try {
    const events = await this.store.events.find({ db: this.database.name, ns: this.namespace.name, stream: this.stream, after: id })
  }
  catch (error) {
    this.error = error
  }
})

When('I search for events starting from event with ID {string}', async function (id) {
  const event = await this.store.events.read({ db: this.database.name, ns: this.namespace.name, stream: this.stream, event: id })
  assert(event)
  const events = await this.store.events.find({ db: this.database.name, ns: this.namespace.name, stream: this.stream, from: event.meta.ts })
  const events2 = await this.store.events.find({ db: this.database.name, ns: this.namespace.name, stream: this.stream, from: event.meta.id })
  assert.deepStrictEqual(events, events2)
  const events3 = await this.store.events.find({ db: this.database.name, ns: this.namespace.name, from: `${this.stream}.${event.meta.id}` })
  assert.deepStrictEqual(events, events3)
  this.events = events
})

When('I try to search for events starting from event with ID {string}', async function (id) {
  try {
    const events = await this.store.events.find({ db: this.database.name, ns: this.namespace.name, stream: this.stream, from: id })
  }
  catch (error) {
    this.error = error
  }
})

When('I search for events until event with ID {string}', async function (id) {
  const event = await this.store.events.read({ db: this.database.name, ns: this.namespace.name, stream: this.stream, event: id })
  assert(event)
  const events = await this.store.events.find({ db: this.database.name, ns: this.namespace.name, stream: this.stream, until: event.meta.ts })
  const events2 = await this.store.events.find({ db: this.database.name, ns: this.namespace.name, stream: this.stream, until: event.meta.id })
  assert.deepStrictEqual(events, events2)
  const events3 = await this.store.events.find({ db: this.database.name, ns: this.namespace.name, until: `${this.stream}.${event.meta.id}` })
  assert.deepStrictEqual(events, events3)
  this.events = events
})

When('I try to search for events until event with ID {string}', async function (id) {
  try {
    const events = await this.store.events.find({ db: this.database.name, ns: this.namespace.name, stream: this.stream, until: id })
  }
  catch (error) {
    this.error = error
  }
})

When('I search for events ending on event with ID {string}', async function (id) {
  const event = await this.store.events.read({ db: this.database.name, ns: this.namespace.name, stream: this.stream, event: id })
  assert(event)
  const events = await this.store.events.find({ db: this.database.name, ns: this.namespace.name, stream: this.stream, to: event.meta.ts })
  const events2 = await this.store.events.find({ db: this.database.name, ns: this.namespace.name, stream: this.stream, to: event.meta.id })
  assert.deepStrictEqual(events, events2)
  const events3 = await this.store.events.find({ db: this.database.name, ns: this.namespace.name, to: `${this.stream}.${event.meta.id}` })
  assert.deepStrictEqual(events, events3)
  this.events = events
})

When('I try to search for events ending on event with ID {string}', async function (id) {
  try {
    const events = await this.store.events.find({ db: this.database.name, ns: this.namespace.name, stream: this.stream, to: id })
  }
  catch (error) {
    this.error = error
  }
})

When('I search for events matching type {string}', async function (type) {
  const events = await this.store.events.find({ db: this.database.name, ns: this.namespace.name, stream: this.stream, types: type })
  this.events = events
})

When('I search for events matching type {string} or type {string} with a limit of {int}', async function (type1, type2, limit) {
  const events = await this.store.events.find({ db: this.database.name, ns: this.namespace.name, stream: this.stream, types: [ type1, type2 ], limit })
  this.events = events
})

When('I search for events matching type {string} in namespace {string}', async function (type, ns) {
  const events = await this.store.events.find({ db: this.database.name, ns, types: [ type ] })
  this.events = events
})

When('I search for events matching type {string} in database {string}', async function (type, db) {
  const events = await this.store.events.find({ db, types: [ type ] })
  this.events = events
})

When('I subscribe to {int} events matching type {string} in database {string}', async function (limit, type, db) {
  this.events = []
  await this.store.events.find({ db, types: [ type ], limit, callback: event => this.events.push(event) })
})

Then('I expect to get {int} search results', async function (count) {
  assert(this.events)
  assert.equal(this.events.length, count)
})

Then('I expect search result {int} to be event with ID {string}', async function (position, id) {
  assert(position >= 1)
  assert(position <= this.events.length)
  const event = this.events[position - 1]
  assert(event)
  assert(event.data)
  assert(event.meta)
  assert.equal(event.meta.id, id)
})

Then('I can confirm that event with ID {string} exists', async function (id) {
  const event = await this.store.events.read({ db: this.database.name, ns: this.namespace.name, stream: this.stream, event: id })
  assert(event)
})

Then('I can confirm that content of event with ID {string} is {string}', async function (id, content) {
  const event = await this.store.events.read({ db: this.database.name, ns: this.namespace.name, stream: this.stream, event: id })
  assert(event)
  assert.equal(event.meta.id, id)
  assert.equal(event.meta.stream, this.stream)
  assert.deepStrictEqual(event.data, toObject(content))
})

Then("I can't find event with ID {string}", async function (id) {
  let exists = true
  try {
    const event = await this.store.events.read({ db: this.database.name, ns: this.namespace.name, stream: this.stream, event: id })
  }
  catch (error) {
    if (error instanceof EventNotFound) {
      exists = false
    }
  }
  assert.equal(exists, false)
})

Then('I get an event not found error', async function () {
  assert(this.error instanceof EventNotFound)
  this.error = undefined
})

Then('I get a duplicate event error', async function () {
  assert(this.error instanceof DuplicateEvent)
  this.error = undefined
})

//
// Annotations
//

When('I write annotation {string}', async function (content) {
  const annotation = toObject(content)
  await this.store.annotations.write({ db: this.database.name, ns: this.namespace.name, stream: this.stream, annotation, account: this.account.id })
})

Then('I try to read annotation', async function () {
  try {
    const annotation = await this.store.annotations.read({ db: this.database.name, ns: this.namespace.name, stream: this.stream, account: this.account.id })
  }
  catch (error) {
    this.error = error
  }
})

When('I destroy annotation', async function () {
  await this.store.annotations.destroy({ db: this.database.name, ns: this.namespace.name, stream: this.stream, account: this.account.id })
})

When('I try to destroy annotation', async function () {
  try {
    await this.store.annotations.destroy({ db: this.database.name, ns: this.namespace.name, stream: this.stream, account: this.account.id })
  }
  catch (error) {
    this.error = error
  }
})

Then('I can confirm that annotation exists', async function () {
  const annotation = await this.store.annotations.read({ db: this.database.name, ns: this.namespace.name, stream: this.stream, account: this.account.id })
  assert(annotation)
})

Then('I can confirm that content of annotation is {string}', async function (content) {
  const annotation = await this.store.annotations.read({ db: this.database.name, ns: this.namespace.name, stream: this.stream, account: this.account.id })
  assert(annotation)
  assert.deepStrictEqual(annotation, toObject(content))
})

Then("I can't find annotation", async function () {
  let exists = true
  try {
    const annotation = await this.store.annotations.read({ db: this.database.name, ns: this.namespace.name, stream: this.stream, account: this.account.id })
  }
  catch (error) {
    if (error instanceof AnnotationNotFound) {
      exists = false
    }
  }
  assert.equal(exists, false)
})

Then('I get an annotation not found error', async function () {
  assert(this.error instanceof AnnotationNotFound)
  this.error = undefined
})

//
// Documents
//

Given('collection {string}', async function (collection) {
  this.collection = collection
})

When('I write document {string}', async function (content) {
  const doc = toObject(content)
  this.document = await this.store.documents.write({ db: this.database.name, collection: this.collection, doc })
})

When('I search for documents matching {string}', async function (content) {
  const query = toObject(content)
  this.documents = await this.store.documents.find({ db: this.database.name, collection: this.collection, query })
})

When('I search for documents matching {string} on page {int} with page size {int}', async function (content, page, size) {
  const query = toObject(content)
  this.documents = await this.store.documents.find({ db: this.database.name, collection: this.collection, query, options: { skip: (page - 1) * size, limit: size }})
})

When('I search for documents matching {string} in {string} order of {string}', async function (content, order, column) {
  const query = toObject(content)
  this.documents = await this.store.documents.find({ db: this.database.name, collection: this.collection, query, options: { sort: { by: column, order }}})
})

Then('I try to read document with ID {string}', async function (id) {
  const doc = await this.store.documents.read({ db: this.database.name, collection: this.collection, id })
  this.error = new DocumentNotFound(this.database.name, this.collection, id)
})

When('I destroy the document', async function () {
  await this.store.documents.destroy({ db: this.database.name, collection: this.collection, id: this.document.id })
})

When('I try to destroy document with ID {string}', async function (id) {
  try {
    await this.store.documents.destroy({ db: this.database.name, collection: this.collection, id })
  }
  catch (error) {
    this.error = error
  }
})

Then('I can confirm that content of document with ID {string} is {string}', async function (id, content) {
  const doc = await this.store.documents.read({ db: this.database.name, collection: this.collection, id })
  assert(doc)
  assert.deepStrictEqual(doc, toObject(content))
})

Then("I can't find the document", async function () {
  const doc = await this.store.documents.read({ db: this.database.name, collection: this.collection, id: this.document.id })
  assert(!doc)
})

Then('I get a document not found error', async function () {
  assert(this.error instanceof DocumentNotFound)
  this.error = undefined
})

Then('I count {int} documents', async function (count) {
  assert.equal(count, await this.store.documents.count({ db: this.database.name, collection: this.collection }))
})

Then('I count {int} documents matching {string}', async function (count, content) {
  const query = toObject(content)
  assert.equal(count, await this.store.documents.count({ db: this.database.name, collection: this.collection, query }))
})

Then('I count {int} document matching {string}', async function (count, content) {
  const query = toObject(content)
  assert.equal(count, await this.store.documents.count({ db: this.database.name, collection: this.collection, query }))
})

Then('I get {int} search result', async function (count) {
  assert.equal(this.documents?.length, count)
})

Then('I get {int} search results', async function (count) {
  assert.equal(this.documents?.length, count)
})

Then('search result {int} is {string}', async function (index, content) {
  const doc = toObject(content)
  assert.deepStrictEqual(this.documents[index - 1], doc)
})

//
// Support functions
//

function toObject(str) {
  return JSON5.parse(str)
}
