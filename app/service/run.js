/*
 * @Author: Whzcorcd
 * @Date: 2021-11-23 13:54:21
 * @LastEditors: Whzcorcd
 * @LastEditTime: 2021-11-26 10:56:00
 * @Description: file content
 */
'use strict'

const Service = require('egg').Service
const execute = require('../modules/execute')
const loger = require('../modules/loger')
const target = require('../modules/target')

process.env.LOGER_DISPLAY_COLOR = 5

class RunService extends Service {
  index(project) {
    const config = project => {
      let options = {
        parallel: require('os').cpus.length,
        force: false,
      }
      const PROJECT = target.targetProjectPath(project)
      try {
        // 尝试加载配置文件
        const projectOptions = require(PROJECT)
        options = Object.assign(options, projectOptions)
        // TODO: 整合默认配置 & 合法性校验
      } catch (e) {
        loger.error(`configuration not found: "${project}"`)
        process.exit(1)
      }
      return options
    }

    execute(config(project), target.CONTEXT).catch(errors =>
      process.nextTick(() => {
        loger.error(errors)
        process.exit(1)
      })
    )
  }
}

module.exports = RunService
