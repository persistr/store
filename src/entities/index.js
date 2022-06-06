const fs = require('fs')
const path = require('path')

const entities = []

// TODO: Move to 'fs-traversal' package.
const visit_folder = (base, dirs, fn) => {
  const folder = path.resolve(base, ...dirs)
  fs.readdirSync(folder).forEach(file => {
    if (fs.statSync(`${folder}/${file}`).isDirectory()) return visit_folder(base, [ ...dirs, file ], fn)
    if (file.toLowerCase().endsWith('.js')) fn(base, dirs, folder, file, path.resolve(folder, file))
  })
}

// Register all entities.
visit_folder(path.resolve(__dirname), [], (base, dirs, folder, file, filepath) => {
  const info = path.parse(file)
  if (info.ext !== '.js' || info.name === 'index') return
  entities.push({ name: dirs.join('.'), method: info.name, module: require(filepath) })
})

module.exports = entities
