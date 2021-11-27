/*
 * @Author: Whzcorcd
 * @Date: 2021-11-23 14:07:32
 * @LastEditors: Whzcorcd
 * @LastEditTime: 2021-11-28 00:25:47
 * @Description: file content
 */
'use strict'

const fs = require('fs/promises')
const { serial } = require('./queue')
const create = require('./create')
const loger = require('./loger')
const error = require('./error')
const {
  targetProductPath,
  regionProductPath,
  appProductPath,
  nginxProductPath,
} = require('./target')
const { runInit } = require('./git')
const replaceDependencies = require('./dependency')
const { runTasks } = require('./task')
const { runExtract } = require('./extract')
const { createNginxFile, runNginx } = require('./nginx')

const PACKAGE = require('../../package.json')

const execute = (options = {}) => {
  const time = Date.now()

  loger.log('░░', `${PACKAGE.name}:`, `v${PACKAGE.version}`)

  return serial([
    async () => {
      loger.log('Create')
      const deploy = options.deploy
      try {
        await fs.access(targetProductPath(deploy.target))
      } catch (e) {
        await fs.mkdir(targetProductPath(deploy.target))
        await fs.mkdir(regionProductPath(deploy.target, deploy.region))
        await fs.mkdir(appProductPath(deploy.target, deploy.region))
      }

      const nginxPath = nginxProductPath(deploy.target, deploy.region)
      await fs.writeFile(nginxPath, '')
      await createNginxFile(nginxPath, options)

      // 将外部输入的配置转换成内部任务描述队列
      return create(options)
    },

    // 仓库同步器
    async tasks => {
      loger.log('Git clone/pull')
      await runInit(tasks, options.parallel)
      return tasks
    },

    tasks => {
      loger.log('Upgrade')
      tasks.map(task => replaceDependencies(task))
      return tasks
    },

    // 命令执行器
    async tasks => {
      loger.log('Install & Build')
      await runTasks(tasks, options.parallel)
      return tasks
    },

    // 成品提取器
    async tasks => {
      loger.log('Extract')
      await runExtract(tasks, options.parallel)
      return tasks
    },

    // 配置文件生成器
    async tasks => {
      loger.log('Generate')
      return runNginx(tasks)
    },
  ]).then(results => {
    const timeEnd = Math.round((Date.now() - time) / 1000)
    error.analyse(options)
    loger.log('░░', `${PACKAGE.name}:`, `${timeEnd}s`)
    error.clear()
    return results[results.length - 1]
  })
}

module.exports = execute
