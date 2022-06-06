const assert = require('assert')
const { After } = require('@cucumber/cucumber')
After(async function() {
  assert(!this.error)
  this.error = undefined
  this.account = undefined
  this.database = undefined
  this.namespace = undefined
  this.stream = undefined
  this.events = undefined
  await this.store.disconnect()
})
