const assert = require('assert')
const { After } = require('@cucumber/cucumber')
After(async function() {
  assert(!this.error)
  this.config = undefined
  this.error = undefined
  this.account = undefined
  this.database = undefined
  this.namespace = undefined
  this.stream = undefined
  this.events = undefined
  this.collection = undefined
  this.document = undefined
  this.documents = undefined
  if (this.cxn) await this.cxn.disconnect()
  this.cxn = undefined
})
