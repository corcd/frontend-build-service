/*
 * @Author: Whzcorcd
 * @Date: 2021-11-23 16:33:26
 * @LastEditors: Whzcorcd
 * @LastEditTime: 2022-03-26 23:44:26
 * @Description: file content
 */
'use strict'

const { Command } = require('commander')
const execute = require('../app/modules/execute')
const pack = require('../app/modules/pack')
const { updateVersion } = require('../app/modules/version')
const { clearOneContainer,
  clearAllContainer } = require('../app/modules/clear')
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

program.version(require('../package.json').version, '-v')

program
  .usage('<options>')
  .command('build')
  .description('build the project')
  .option('--project <name>', 'the project name')
  .option('--filter <task>', 'the filtered task name')
  .option('--pack <version>', 'pack the project')
  .alias('b')
  .action(async params => {
    await execute(config(params.project), params.filter).catch(errors =>
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
  .usage('<options>')
  .command('pack')
  .description('pack the project')
  .option('--project <name>', 'the project name')
  .option('--release <version>', 'the project release version')
  .alias('p')
  .action(params => {
    pack(config(params.project), params.project, params.release).catch(errors =>
      process.nextTick(() => {
        console.error(errors)
        process.exit(1)
      })
    )
  })

program
  .usage('<options>')
  .command('upgrade')
  .description('upgrade the project version')
  .option('--project <name>', 'the project name')
  .option('--release <version>', 'the project release version')
  .alias('u')
  .action(async params => {
    await updateVersion(config(params.project), params.project, params.release)
  })

program
  .usage('<options>')
  .command('clear')
  .description('clear the container')
  .option('--container <name>', 'the container name')
  .option('--all', 'all containers')
  .alias('c')
  .action(async params => {
    if (params.all) {
      await clearAllContainer()
    } else {
      clearOneContainer(params.container)
    }
  })

program.parse(process.argv)
