/*
 * @Author: Whzcorcd
 * @Date: 2021-11-26 10:27:25
 * @LastEditors: Whzcorcd
 * @LastEditTime: 2021-11-26 10:36:33
 * @Description: file content
 */
'use strict'

const { resolve } = require('path')

const CONTEXT = process.cwd()

const rootPath = resolve(CONTEXT, './workspace')
const projectPath = resolve(rootPath, './projects')
const containerPath = resolve(rootPath, './containers')
const productPath = resolve(rootPath, './products')

const targetProjectPath = project => resolve(projectPath, `./${project}.json`)

const targetContainerPath = target => resolve(containerPath, `./${target}`)

const targetProductPath = target => resolve(productPath, `./${target}`)
const regionProductPath = (target, region) =>
  resolve(targetProductPath(target), `./${region}`)
const appProductPath = (target, region) =>
  resolve(targetProductPath(target, region), './app')

module.exports = {
  CONTEXT,

  rootPath,

  projectPath,
  containerPath,
  productPath,

  targetProjectPath,

  targetContainerPath,

  targetProductPath,
  regionProductPath,
  appProductPath,
}
