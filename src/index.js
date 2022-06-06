const EventEmitter = require('events')
const crypto = require('@persistr/server-crypto')
const entities = require('./entities')
const Knex = require('knex')
const trycatch = require('./util/trycatch')
const uuid = require('./util/uuid')

class StoreConnection {
  constructor (config) {
    // Save config.
    this.identity = config.identity
    this.store = config.store

    // Add entity-related methods to the store.
    entities.forEach(entity => {
      if (!this[entity.name]) this[entity.name] = {}
      this[entity.name][entity.method] = async function (...args) {
        return await this.store[entity.name][entity.method](this.identity, ...args)
      }.bind(this)
    })
  }

  async disconnect () {
    await this.store.disconnect()
  }
}

class Store extends EventEmitter {
  constructor (url, options) {
    super()

    // Add entity-related methods to the store.
    entities.forEach(entity => {
      if (!this[entity.name]) this[entity.name] = {}
      this[entity.name][entity.method] = async function (identity, ...args) {
        this?.policy?.enforce(this.toolbox, identity, entity.name, entity.method, args)
        return await entity.module(this.toolbox, identity, ...args)
      }.bind(this)
    })

    // Save config.
    this.url = url
    this.options = options

    // Set security policy.
    this.policy = options?.policy

    // Configure toolbox.
    this.toolbox = { store: this, crypto, trycatch, uuid }
  }

  // Connection

  async connect (url, options) {
    if (!url) url = this.url
    if (!options) options = this.options

    const parsed = new URL(url)
    const config = {
      client: parsed.protocol.replace(':', ''),
      connection: {
        host: parsed.hostname,
        port: parsed.port,
        user: parsed.username,
        password: parsed.password,
        database: parsed.pathname
      }
    }

    if (config.client === 'sqlite3') {
      config.useNullAsDefault = true
      config.connection.filename = config.connection.database
      if (config.connection.filename === 'memory') {
        config.connection.filename = ':memory:'
      }
    }

    this.knex = Knex(config)
    this.toolbox = { ...this.toolbox, knex: this.knex }

    await initialize(this.knex, config.client)

    return new StoreConnection({ store: this, identity: options?.identity })
  }

  async disconnect () {
    this.toolbox = { ...this.toolbox, knex: undefined }
    if (this.knex) {
      await this.knex.destroy()
      this.knex = undefined
    }
  }
}

async function initialize(knex, client) {
  await knex.schema.hasTable('AccountDatabases').then(exists => {
    if (!exists) return knex.schema.createTable('AccountDatabases', table => {
      if (client === 'mysql') table.charset('utf8mb4')
      table.binary('idDB', 16).notNullable()
      table.binary('idAccount', 16).notNullable()
      table.string('type', 45).notNullable()
      table.primary(['idDB', 'idAccount'])
    })
  })
  await knex.schema.hasTable('Accounts').then(exists => {
    if (!exists) return knex.schema.createTable('Accounts', table => {
      if (client === 'mysql') table.charset('utf8mb4')
      table.binary('id', 16).notNullable().primary()
      table.string('username', 321).notNullable().unique()
      table.text('name').notNullable()
      table.string('password', 300).notNullable()
      table.string('key', 500).notNullable()
      table.tinyint('isActive', 4).notNullable() //.defaultTo('1')
      table.tinyint('isRoot', 4).notNullable() //.defaultTo('0')
    })
  })
  await knex.schema.hasTable('Annotations').then(exists => {
    if (!exists) return knex.schema.createTable('Annotations', table => {
      if (client === 'mysql') table.charset('utf8mb4')
      table.binary('db', 16).notNullable()
      table.binary('ns', 16).notNullable()
      table.binary('stream', 16).notNullable()
      table.json('annotation').notNullable()
      table.primary(['db', 'ns', 'stream'])
    })
  })
  await knex.schema.hasTable('Databases').then(exists => {
    if (!exists) return knex.schema.createTable('Databases', table => {
      if (client === 'mysql') table.charset('utf8mb4')
      table.binary('id', 16).notNullable().primary()
      table.string('name', 100).notNullable().unique()
    })
  })
  await knex.schema.hasTable('Events').then(exists => {
    if (!exists) return knex.schema.createTable('Events', table => {
      if (client === 'mysql') table.charset('utf8mb4')
      table.binary('db', 16).notNullable()
      table.binary('ns', 16).notNullable()
      table.binary('stream', 16).notNullable()
      table.binary('id', 16).notNullable()
      table.integer('version', 10) //.defaultTo(null)
      table.timestamp('ts', { precision: 6 }).notNullable()
      table.json('meta').notNullable()
      table.json('data').notNullable()
      table.string('type', 100).notNullable()
      table.primary(['db', 'ns', 'stream', 'id'])
    })
  })
  await knex.schema.hasTable('Namespaces').then(exists => {
    if (!exists) return knex.schema.createTable('Namespaces', table => {
      if (client === 'mysql') table.charset('utf8mb4')
      table.binary('db', 16).notNullable()
      table.binary('id', 16).notNullable().primary()
      table.string('name', 100).notNullable()
      table.unique(['name', 'db'])
    })
  })
  await knex.schema.hasTable('Objects').then(exists => {
    if (!exists) return knex.schema.createTable('Objects', table => {
      if (client === 'mysql') table.charset('utf8mb4')
      table.binary('db', 16).notNullable()
      table.string('id', 100).notNullable()
      table.json('data').notNullable()
      table.primary(['db', 'id'])
    })
  })
  await knex.schema.hasTable('Streams').then(exists => {
    if (!exists) return knex.schema.createTable('Streams', table => {
      if (client === 'mysql') table.charset('utf8mb4')
      table.binary('db', 16).notNullable()
      table.binary('domain', 16).notNullable()
      table.binary('stream', 16).notNullable()
      table.json('meta').notNullable()
      table.json('annotation').notNullable()
      table.primary(['db', 'domain', 'stream'])
    })
  })
}

module.exports = { Store }
