/*
 * @Author: Whzcorcd
 * @Date: 2021-11-23 14:07:32
 * @LastEditors: Whzcorcd
 * @LastEditTime: 2021-11-25 18:14:42
 * @Description: file content
 */
'use strict'

const { serial } = require('./queue')
const create = require('./create')
const Loger = require('./loger')
const { runInit } = require('./git')
const { runTasks } = require('./task')
const { runExtract } = require('./extract')
const PACKAGE = require('../../package.json')

const execute = (options = {}, context = process.cwd()) => {
  const time = Date.now()
  const loger = new Loger()

  loger.log('░░', `${PACKAGE.name}:`, `v${PACKAGE.version}`)

  return serial([
    // 将外部输入的配置转换成内部任务描述队列
    create(options, context),

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
      return runExtract(tasks, options.parallel)
    },
  ]).then(results => {
    const timeEnd = Math.round((Date.now() - time) / 1000)
    loger.log('░░', `${PACKAGE.name}:`, `${timeEnd}s`)
    return results[results.length - 1]
  })
}

module.exports = execute
