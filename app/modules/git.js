/*
 * @Author: Whzcorcd
 * @Date: 2021-08-06 13:57:14
 * @LastEditors: Whzcorcd
 * @LastEditTime: 2021-11-26 10:13:23
 * @Description: file content
 */
'use strict'

const path = require('path')
const fs = require('fs/promises')
const queue = require('./queue')
const loger = require('./loger')
const { runCmd } = require('./run')

// function clone(repo, targetPath, options) {
//   options = options || {}

//   const cmd = options.git || 'git'
//   const args = ['clone']

//   if (options.shallow) {
//     args.push('--depth')
//     args.push('1')
//   }

//   args.push(repo)
//   args.push(targetPath)

//   return new Promise((resolve, reject) => {
//     const checkout = () => {
//       const args = ['checkout', '-q', '--track', options.checkout]

//       return new Promise((resolve, reject) => {
//         const process = spawnFactory(cmd, args, {
//           cwd: targetPath,
//           detached: true,
//           stdio: 'inherit',
//           shell: true,
//         })
//         process.on('close', code => {
//           if (code !== 0) {
//             return reject(
//               new Error(`checkout child process exited with code ${code}`)
//             )
//           }
//           return resolve()
//         })
//       })
//     }

//     const proc = spawnFactory(cmd, args, {
//       detached: true,
//       stdio: 'inherit',
//       shell: true,
//     })
//     proc.on('close', async code => {
//       if (code === 0) {
//         if (options.checkout) {
//           await checkout().catch(err => {
//             return reject(err)
//           })
//         }
//       } else {
//         return reject(new Error(`clone child process exited with code ${code}`))
//       }
//       return resolve()
//     })
//   })
// }

// function pull(options) {
//   options = options || {}

//   const cmd = options.git || 'git'
//   const args = ['pull']

//   if (options.shallow) {
//     args.push('--depth')
//     args.push('1')
//   }

//   return new Promise((resolve, reject) => {
//     const proc = spawnFactory(cmd, args, {
//       cwd: options.path,
//     })
//     proc.on('close', async code => {
//       if (code !== 0) {
//         return reject(new Error(`pull child process exited with code ${code}`))
//       }
//       return resolve()
//     })
//   })
// }

const runInit = async (tasks, parallel = require('os').cpus().length) => {
  const context = process.cwd()
  const dirs = await fs.readdir(path.resolve(context, './workspace/containers'))
  const taskSet = [[]]
  let preOrder = 0

  const isInit = name => !dirs.includes(name)

  const generateCloneCommand = (repository, targetPath) => {
    const cmd = repository.type || 'git'
    const args = [cmd, 'clone']

    if (repository.shallow) {
      args.push('--depth')
      args.push('1')
    }

    args.push(repository.url)
    args.push(targetPath)

    return args
  }

  const generatePullCommand = repository => {
    const cmd = repository.type || 'git'
    const args = [cmd, 'pull']

    if (repository.shallow) {
      args.push('--depth')
      args.push('1')
    }

    return args
  }

  const generateCheckoutCommand = repository => {
    const cmd = repository.type || 'git'
    const args = [cmd, 'checkout', '-q', '--track', repository.branch]

    return args
  }

  const generateTaskFunc = task => () => {
    const time = Date.now()
    const cmd = isInit(task.name)
      ? generateCloneCommand(task.repository, task.path)
      : generatePullCommand(task.repository)

    return runCmd(cmd, {
      cwd: isInit(task.name) ? process.cwd(0) : task.path,
      target: 'custom',
    })
      .then(() => {
        const timeEnd = Math.round((Date.now() - time) / 1000)
        loger.log('░░', 'ElapsedTime:', `${timeEnd}s`)
      })
      .catch(errors => {
        throw errors
      })
  }

  const generateCheckoutTaskFunc = task => () => {
    const time = Date.now()

    return runCmd(
      generateCheckoutCommand(task.repository),
      Object.assign({
        cwd: task.path,
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

  tasks
    .sort((a, b) => a.order - b.order)
    .forEach(task => {
      if (task.order === preOrder) {
        taskSet[taskSet.length - 1].push(generateTaskFunc(task))
        isInit(task.name) &&
          taskSet[taskSet.length - 1].push(generateCheckoutTaskFunc(task))
      } else {
        const len = taskSet.push([generateTaskFunc(task)])
        isInit(task.name) &&
          taskSet[len - 1].push(generateCheckoutTaskFunc(task))
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

module.exports = {
  runInit,
}
