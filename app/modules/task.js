/*
 * @Author: Whzcorcd
 * @Date: 2021-11-22 13:07:42
 * @LastEditors: Whzcorcd
 * @LastEditTime: 2021-11-26 10:14:27
 * @Description: file content
 */
'use strict'

const queue = require('./queue')
const loger = require('./loger')
const { runCmd } = require('./run')

class Repository {
  constructor({ type = 'git', url = '', branch = 'master' }) {
    this.repository = {
      type: type.toLowerCase(),
      url,
      branch,
    }
  }

  // async clone(path, options = {}) {
  //   await clone(
  //     this.repository.url,
  //     path,
  //     Object.assign(
  //       {
  //         checkout: this.repository.branch,
  //       },
  //       options
  //     )
  //   )
  // }

  // async update(options = {}) {
  //   await pull(options)
  // }

  // async clear() {
  //   // TODO
  // }
}

class Dependencies {
  constructor({ name, path }) {
    this.name = name
    this.path = path
  }
}

class Program {
  constructor({ command, options }) {
    this.command = command
    this.options = options
  }
}

class Deploy {
  constructor({ target, ignore, directory }) {
    this.target = target
    this.ignore = ignore
    this.directory = directory
  }
}

class Task extends Repository {
  constructor({
    name,
    path,
    repository,
    dependencies,
    program,
    deploy,
    order,
    dirty,
  }) {
    super(repository)
    this.name = name
    this.path = path
    this.dependencies = dependencies.map(lib => new Dependencies(lib))
    this.program = new Program(program)
    this.deploy = new Deploy(deploy)
    this.order = order
    this.dirty = dirty
  }
}

// 任务执行器
const runTasks = (tasks, parallel = require('os').cpus().length) => {
  const taskSet = [[]]
  let preOrder = 0

  // 将任务转换成 Promise
  function generateTaskFunc(task) {
    const program = task.program

    if (Array.isArray(program.command)) {
      return program.command.map(command => () => {
        const time = Date.now()

        return runCmd(
          command,
          Object.assign({ cwd: task.path }, program.options)
        )
          .then(() => {
            const timeEnd = Math.round((Date.now() - time) / 1000)
            loger.log('░░', 'ElapsedTime:', `${timeEnd}s`)
          })
          .catch(errors => {
            throw errors
          })
      })
    }

    return [
      () => {
        const time = Date.now()

        return runCmd(
          program.command,
          Object.assign({ cwd: task.path }, program.options)
        )
          .then(() => {
            const timeEnd = Math.round((Date.now() - time) / 1000)
            loger.log('░░', 'ElapsedTime:', `${timeEnd}s`)
          })
          .catch(errors => {
            throw errors
          })
      },
    ]
  }

  tasks
    .sort((a, b) => a.order - b.order)
    .forEach(task => {
      if (task.order === preOrder) {
        generateTaskFunc(task).map(func =>
          taskSet[taskSet.length - 1].push(func)
        )
      } else {
        taskSet.push([...generateTaskFunc(task)])
      }
      preOrder = task.order
    })

  // return queue
  // .serial(
  //   taskSet.map(set => () => {
  //     return queue.parallel(set, parallel)
  //   })
  // )
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

module.exports = { Task, runTasks }
