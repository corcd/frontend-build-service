/*
 * @Author: Whzcorcd
 * @Date: 2022-03-25 23:20:45
 * @LastEditors: Whzcorcd
 * @LastEditTime: 2022-03-26 23:19:33
 * @Description: file content
 */
'use strict'

const fs = require('fs/promises')
const rimraf = require('rimraf')
const { containerPath, targetContainerPath } = require('./target')

const clearOneContainer = name => {
  if (!name) return

  rimraf.sync(targetContainerPath(name))
}

const clearAllContainer = async () => {
  rimraf.sync(containerPath)
  await fs.mkdir(containerPath)
}

module.exports = {
  clearOneContainer,
  clearAllContainer,
}
