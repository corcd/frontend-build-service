/*
 * @Author: Whzcorcd
 * @Date: 2021-08-06 13:54:41
 * @LastEditors: Whzcorcd
 * @LastEditTime: 2021-12-11 16:47:04
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

const replace = (task, options) => {
  const time = Date.now()
  const dependencies = Object.assign(
    {},
    task.dependencies || [],
    options.dependencies
  )

  try {
    const packagePath = resolve(task.path, './package.json')
    const pkg = require(packagePath)

    if (dependencies.length > 0) {
      dependencies.forEach(dependency => {
        const dependencyName = `dependencies.${dependency.name}`
        const devDependencyName = `devDependencies.${dependency.version}`
        steelToe(pkg).get(dependencyName) &&
          steelToe(pkg).set(dependencyName, dependency.version)
        steelToe(pkg).get(devDependencyName) &&
          steelToe(pkg).set(devDependencyName, dependency.version)
      })
      write(packagePath, pkg)
    }
  } catch (e) {
    loger.error(e)
  }

  const timeEnd = Math.round((Date.now() - time) / 1000)
  loger.log('░░', 'ElapsedTime:', `${timeEnd}s`)
}

const replaceDependencies = (tasks, options) => {
  tasks.map(task => replace(task, options))
  return tasks
}

module.exports = replaceDependencies
