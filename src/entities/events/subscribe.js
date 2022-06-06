module.exports = async (toolbox, identity, subscription) => {
  const { store } = toolbox
  if (!store.events.subscriptions) store.events.subscriptions = []
  return store.events.subscriptions.push({ ...subscription, id: store.events.subscriptions.length })
}
