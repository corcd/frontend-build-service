/*
 * @Author: Whzcorcd
 * @Date: 2021-11-23 16:33:26
 * @LastEditors: Whzcorcd
 * @LastEditTime: 2021-11-26 11:52:20
 * @Description: file content
 */
'use strict'

const program = require('commander')
const execute = require('../app/modules/execute')
const loger = require('../app/modules/loger')
const target = require('../app/modules/target')

process.env.LOGER_DISPLAY_COLOR = 5

program
  .version(require('../package.json').version)
  .usage('[options]')
  .option('--project [name]', 'the project name')
  .parse(process.argv)

const config = project => {
  let options = {
    parallel: require('os').cpus().length,
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

execute(config(program._optionValues.project)).catch(errors =>
  process.nextTick(() => {
    loger.error(errors)
    process.exit(1)
  })
)
