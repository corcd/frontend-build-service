/*
 * @Author: Whzcorcd
 * @Date: 2021-08-06 13:54:41
 * @LastEditors: Whzcorcd
 * @LastEditTime: 2021-11-28 00:27:05
 * @Description: file content
 */
'use strict'

const { resolve } = require('path')
const fs = require('fs')
const steelToe = require('steeltoe')
const loger = require('./loger')

const endOfLine = require('os').EOL
const write = (file, data) => {
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + endOfLine)
}

const replaceDependencies = (task, dependencies) => {
  const time = Date.now()
  const packagePath = resolve(task.path, './package.json')
  const pkg = require(packagePath)

  if (dependencies.length === 0) return

  dependencies.forEach(dependency => {
    const dependencyName = `dependencies.${dependency.name}`
    const devDependencyName = `devDependencies.${dependency.version}`
    steelToe(pkg).get(dependencyName) &&
      steelToe(pkg).set(dependencyName, dependency.version)
    steelToe(pkg).get(devDependencyName) &&
      steelToe(pkg).set(devDependencyName, dependency.version)
  })
  write(packagePath, pkg)

  const timeEnd = Math.round((Date.now() - time) / 1000)
  loger.log('░░', 'ElapsedTime:', `${timeEnd}s`)
}

module.exports = replaceDependencies
