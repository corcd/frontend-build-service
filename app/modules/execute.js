/*
 * @Author: Whzcorcd
 * @Date: 2021-11-23 14:07:32
 * @LastEditors: Whzcorcd
 * @LastEditTime: 2021-11-26 10:57:16
 * @Description: file content
 */
'use strict'

const { resolve } = require('path')
const fs = require('fs/promises')
const { serial } = require('./queue')
const create = require('./create')
const loger = require('./loger')
const error = require('./error')
const { runInit } = require('./git')
const { runTasks } = require('./task')
const { runExtract } = require('./extract')
const { createNginxFile, runNginx } = require('./nginx')

const PACKAGE = require('../../package.json')

const execute = (options = {}, context = process.cwd()) => {
  const time = Date.now()

  loger.log('░░', `${PACKAGE.name}:`, `v${PACKAGE.version}`)

  return serial([
    async () => {
      loger.log('Create')
      const path = resolve(
        context,
        `./workspace/products/${options.deploy.target}/nginx.conf`
      )
      await fs.writeFile(path, '')
      await createNginxFile(path, options)

      // 将外部输入的配置转换成内部任务描述队列
      return create(options, context)
    },

    // 仓库同步器
    async tasks => {
      loger.log('Git clone/pull')
      await runInit(tasks, options.parallel)
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
    error.analyse()
    loger.log('░░', `${PACKAGE.name}:`, `${timeEnd}s`)
    error.clear()
    return results[results.length - 1]
  })
}

module.exports = execute
