/*
 * @Author: Whzcorcd
 * @Date: 2021-11-29 12:32:00
 * @LastEditors: Whzcorcd
 * @LastEditTime: 2021-11-29 16:34:13
 * @Description: file content
 */
'use strict'

const { runCmd } = require('./run')
const { regionProductPath } = require('./target')
const loger = require('./loger')
const generateDockerfile = require('./dockerfile')

const pack = async options => {
  const time = Date.now()

  const generatePackCommand = options => {
    const cmd = 'docker'
    const name = `registry.cn-hangzhou.aliyuncs.com/gd-hub/${options.deploy.target}-fe-${options.deploy.region}`
    const args = [
      cmd,
      'image',
      'build',
      '-f',
      'Dockerfile',
      '-t',
      `${name}:${options.deploy.version}`,
      '.',
    ]

    return args
  }

  const generatePublishCommand = options => {
    const cmd = 'docker'
    const name = `registry.cn-hangzhou.aliyuncs.com/gd-hub/${options.deploy.target}-fe-${options.deploy.region}`
    const args = [cmd, 'push', `${name}:${options.deploy.version}`]

    return args
  }

  await generateDockerfile(options)

  return runCmd(generatePackCommand(options), {
    cwd: regionProductPath(options.deploy.target, options.deploy.region),
    target: 'custom',
  })
    .then(generatePublishCommand(options))
    .then(() => {
      const timeEnd = Math.round((Date.now() - time) / 1000)
      loger.log('░░', 'ElapsedTime:', `${timeEnd}s`)
    })
    .catch(errors => {
      throw errors
    })
}

module.exports = pack
