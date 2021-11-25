/*
 * @Author: Whzcorcd
 * @Date: 2021-11-23 16:33:26
 * @LastEditors: Whzcorcd
 * @LastEditTime: 2021-11-24 14:30:15
 * @Description: file content
 */
'use strict'

const path = require('path')
const program = require('commander')
const execute = require('../app/modules/execute')
const CONTEXT = process.cwd()

process.env.LOGER_DISPLAY_COLOR = 1

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

execute(config(program._optionValues.project), CONTEXT).catch(errors =>
  process.nextTick(() => {
    console.error(errors)
    process.exit(1)
  })
)
