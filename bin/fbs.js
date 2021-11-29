/*
 * @Author: Whzcorcd
 * @Date: 2021-11-23 16:33:26
 * @LastEditors: Whzcorcd
 * @LastEditTime: 2021-11-29 16:36:50
 * @Description: file content
 */
'use strict'

const { Command } = require('commander')
const execute = require('../app/modules/execute')
const pack = require('../app/modules/pack')
const loger = require('../app/modules/loger')
const target = require('../app/modules/target')

process.env.LOGER_DISPLAY_COLOR = 5

const program = new Command()
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
    console.error(e)
    loger.error(`configuration not found: "${project}"`)
    process.exit(1)
  }
  return options
}

program.version(require('../package.json').version, '-v, --version')

program
  .usage('<options>')
  .option('--project <name>', 'the project name')
  .option('--pack', 'pack the project')
  .action(async params => {
    await execute(config(params.project)).catch(errors =>
      process.nextTick(() => {
        loger.error(errors)
        process.exit(1)
      })
    )

    if (params.pack) {
      pack(config(params.project)).catch(errors =>
        process.nextTick(() => {
          console.error(errors)
          process.exit(1)
        })
      )
    }
  })

program
  .command('pack <name>')
  .description('pack the project')
  .alias('p')
  .action(name => {
    pack(config(name)).catch(errors =>
      process.nextTick(() => {
        console.error(errors)
        process.exit(1)
      })
    )
  })

program.parse(process.argv)
