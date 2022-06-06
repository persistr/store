module.exports = async (toolbox, identity, subscriptionID) => {
  const { store } = toolbox
  const index = subscriptionID - 1
  store.events.subscriptions.splice(index, 1)
}
