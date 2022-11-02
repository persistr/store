const { Before, Given, When, Then } = require('@cucumber/cucumber')
const { Store } = require('../../src')
Before(async function() {
  this.store = new Store()
  this.cxn = await this.store.connect(process.env.DB)
})
