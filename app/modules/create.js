/*
 * @Author: Whzcorcd
 * @Date: 2021-11-22 17:25:30
 * @LastEditors: Whzcorcd
 * @LastEditTime: 2021-11-28 00:22:52
 * @Description: file content
 */
'use strict'

const defaultsDeep = require('lodash/defaultsDeep')
const { Task } = require('./task')
const { targetContainerPath } = require('./target')
const template = require('./template')
const DEFAULT = require('../config/program.default.json')

const create = options => {
  const tasks = []

  // 解析仓库属性
  const parseRepository = repository => {
    if (typeof repository === 'string') {
      repository = {
        type: 'git',
        url: repository,
        branch: 'master',
      }
    }
    return repository
  }

  // 解析附加依赖
  const parseDependencies = lib => {
    return lib
  }

  // 解析指令
  const parseProgram = program => {
    if (typeof program === 'string' || Array.isArray(program)) {
      program = {
        command: program,
        options: {},
      }
    }
    return program
  }

  // 解析指令
  const parseDeploy = deploy => {
    if (typeof deploy === 'string') {
      deploy = {
        target: deploy,
        host: '',
        region: 'consoles',
        ports: {
          http: 80,
          https: 443,
        },
        directory: './dist',
        ignore: false,
      }
    }
    return deploy
  }

  // 解析模板字符串
  const parseTemplate = (target, variables) => {
    const type = typeof target
    if (type === 'string') {
      return template(target, variables)
    } else if (Array.isArray(target)) {
      return target.map(target => parseTemplate(target, variables))
    } else if (type === 'object' && type !== null) {
      const object = {}
      Object.keys(target).forEach(key => {
        object[key] = parseTemplate(target[key], variables)
      })
      return object
    }
    return target
  }

  // 解析任务
  const parseTask = (task, order) => {
    if (typeof task === 'string') {
      task = {
        name: 'default',
        repository: task,
        dependencies: [],
        program: {},
      }
    }
    task = {
      name: task.name,
      path: targetContainerPath(task.name),
      repository: task.repository,
      dependencies: [].concat(
        task.dependencies || [],
        options.dependencies || []
      ),
      program: defaultsDeep(
        {},
        parseProgram(task.program),
        parseProgram(options.program),
        DEFAULT
      ),
      deploy: defaultsDeep(
        {},
        parseDeploy(task.deploy),
        parseDeploy(options.deploy)
      ),
    }

    const templateData = {
      taskName: task.name,
      taskPath: task.path,
      taskDirname: task.name,
    }
    const repository = parseRepository(task.repository)
    const dependencies = task.dependencies.map(parseDependencies)
    const program = parseTemplate(task.program, templateData)
    const deploy = parseTemplate(task.deploy, templateData)

    return new Task({
      name: task.name,
      path: task.path,
      repository,
      dependencies,
      program,
      deploy,
      order,
      dirty: false,
    })
  }

  const each = (task, index) => {
    if (Array.isArray(task)) {
      task.forEach(task => each(task, index))
    } else {
      tasks.push(parseTask(task, index))
    }
  }

  options.tasks.forEach(each)
  return tasks
}

module.exports = create
