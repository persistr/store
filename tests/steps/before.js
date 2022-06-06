const { Before, Given, When, Then } = require('@cucumber/cucumber')
const { Store } = require('../../src')
Before(async function() {
  const store = new Store()
  this.store = await store.connect(process.env.DB)
  this.knex = store.knex
})
