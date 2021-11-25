/*
 * @Author: Whzcorcd
 * @Date: 2021-11-23 13:54:21
 * @LastEditors: Whzcorcd
 * @LastEditTime: 2021-11-23 16:50:07
 * @Description: file content
 */
'use strict'

const Service = require('egg').Service
const path = require('path')
const execute = require('../modules/execute')
const CONTEXT = process.cwd()

process.env.LOGER_DISPLAY_COLOR = 1

class RunService extends Service {
  index(project) {
    const config = project => {
      let options = {
        parallel: require('os').cpus.length,
        force: false,
      }
      const PROJECT = path.resolve(CONTEXT, `./workspace/projects/${project}.json`)
      try {
        // 尝试加载配置文件
        const projectOptions = require(PROJECT)
        options = Object.assign(options, projectOptions)
        // TODO: 整合默认配置
      } catch (e) {
        console.error(`configuration not found: "${project}"`)
        process.exit(1)
      }
      return options
    }

    execute(config(project), CONTEXT).catch(errors => process.nextTick(() => {
      console.error(errors)
      process.exit(1)
    }))
  }
}

module.exports = RunService
