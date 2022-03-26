/*
 * @Author: Whzcorcd
 * @Date: 2021-11-29 12:32:00
 * @LastEditors: Whzcorcd
 * @LastEditTime: 2022-03-26 23:33:07
 * @Description: file content
 */
'use strict'

const { runCmd } = require('./run')
const { CONTEXT, regionProductPath } = require('./target')
const { updateVersion } = require('./version')
const loger = require('./loger')
const generateDockerfile = require('./dockerfile')

const pack = async (options, project, release = 'patch') => {
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

  await updateVersion(options, project, release)
  await generateDockerfile(options)

  return runCmd(generatePackCommand(options), {
    cwd: regionProductPath(options.deploy.target, options.deploy.region),
    target: 'custom',
  })
    .then(() =>
      runCmd(generatePublishCommand(options), {
        cwd: CONTEXT,
        target: 'custom',
      })
    )
    .then(() => {
      const timeEnd = Math.round((Date.now() - time) / 1000)
      loger.log('░░', 'ElapsedTime:', `${timeEnd}s`)
    })
    .catch(errors => {
      throw errors
    })
}

module.exports = pack
