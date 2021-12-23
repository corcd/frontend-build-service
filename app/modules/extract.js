/*
 * @Author: Whzcorcd
 * @Date: 2021-11-25 13:38:46
 * @LastEditors: Whzcorcd
 * @LastEditTime: 2021-12-23 14:02:30
 * @Description: file content
 */
'use strict'

const path = require('path')
const fs = require('fs/promises')
const rimraf = require('rimraf')
const queue = require('./queue')
const loger = require('./loger')
const { targetContainerPath, appProductPath } = require('./target')

const remove = path => {
  return new Promise((resolve, reject) => {
    rimraf(path, err => {
      if (err) {
        return reject(err)
      }
      return resolve()
    })
  })
}

const create = async path => {
  try {
    await fs.access(path)
    await remove(path).catch(err => {
      return Promise.reject(err)
    })
  } catch (e) {
    await fs.mkdir(path)
  }
}

const transfer = async (origin, path) => {
  try {
    await fs.rename(origin, path)
  } catch (err) {
    return Promise.reject(err)
  }
}

const extract = async task => {
  const deploy = task.deploy
  const isCustomizedLocation = Object.prototype.hasOwnProperty.call(
    deploy,
    'location'
  )

  // ssr 项目不参与主包部署
  if (deploy.ignore) return

  const locationArr = deploy.location.split('/')
  const containerPath = path.resolve(
    targetContainerPath(task.name),
    deploy.directory
  )

  if (isCustomizedLocation) {
    while (locationArr.length > 0) {
      const tempPath = path.resolve(
        appProductPath(deploy.target, deploy.region),
        `./${locationArr.shift()}`
      )
      await create(tempPath)
      await transfer(
        containerPath,
        path.resolve(
          appProductPath(deploy.target, deploy.region),
          `./${deploy.location}`
        )
      )
    }
  } else {
    const appPath = path.resolve(
      appProductPath(deploy.target, deploy.region),
      `./${task.name}`
    )
    await create(appPath)
    await transfer(containerPath, appPath)
  }

  // try {
  //   await fs.access(appPath)
  //   isCustomizedLocation && (await fs.access(`${appPath}/`))
  //   await remove(appPath).catch(err => {
  //     return Promise.reject(err)
  //   })
  // } catch (e) {
  //   await fs.mkdir(appPath)
  // }
  // try {
  //   await fs.rename(
  //     path.resolve(targetContainerPath(task.name), deploy.directory),
  //     appPath
  //   )
  // } catch (err) {
  //   return Promise.reject(err)
  // }
}

const runExtract = async (tasks, parallel = require('os').cpus().length) => {
  const taskSet = [[]]
  let preOrder = 0

  const generateTaskFunc = task => () => {
    const time = Date.now()

    return extract(task)
      .then(() => {
        const timeEnd = Math.round((Date.now() - time) / 1000)
        loger.log('░░', 'ElapsedTime:', `${timeEnd}s`)
      })
      .catch(errors => {
        throw errors
      })
  }

  tasks
    .sort((a, b) => a.order - b.order)
    .forEach(task => {
      if (task.order === preOrder) {
        taskSet[taskSet.length - 1].push(generateTaskFunc(task))
      } else {
        taskSet.push([generateTaskFunc(task)])
      }
      preOrder = task.order
    })

  return queue
    .parallel(
      taskSet.map(set => () => {
        return queue.serial(set)
      }),
      parallel
    )
    .then(buildResults => {
      return [].concat(...buildResults)
    })
}

module.exports = { extract, runExtract }
