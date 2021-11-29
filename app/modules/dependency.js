/*
 * @Author: Whzcorcd
 * @Date: 2021-08-06 13:54:41
 * @LastEditors: Whzcorcd
 * @LastEditTime: 2021-11-29 12:20:56
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

const replace = task => {
  const time = Date.now()
  const dependencies = task.dependencies

  try {
    const packagePath = resolve(task.path, './package.json')
    const pkg = require(packagePath)

    if (
      Object.prototype.hasOwnProperty.call(task, 'increment') ||
      dependencies.length !== 0
    ) {
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

const replaceDependencies = tasks => tasks.map(task => replace(task))

module.exports = replaceDependencies
