/*
 * @Author: Whzcorcd
 * @Date: 2021-06-06 17:56:59
 * @LastEditors: Whzcorcd
 * @LastEditTime: 2021-12-11 18:18:37
 * @Description: file content
 */
'use strict'

const error = require('./error')

// 串行执行任务
const serial = tasks => {
  let p = Promise.resolve()
  const results = []
  const each = task => {
    if (typeof task === 'function') {
      p = p
        .then(task)
        .then(result => {
          results.push(result)
          return result
        })
        .catch(e => error.add(task, e))
    } else {
      each(() => task)
    }
  }
  tasks.forEach(each)
  return p.then(() => results)
}

// 并行执行任务
const parallel = (tasks, limit = tasks.length) => {
  if (limit === tasks.length) {
    // 不指定 limit 时默认逻辑
    return Promise.allSettled(
      tasks.map(task => {
        try {
          return typeof task === 'function' ? task() : task
        } catch (e) {
          error.add(task, e)
          return Promise.reject(e)
        }
      })
    )
  }
  const chunks = []
  const interimTasks = [...tasks]

  for (let i = 0, len = tasks.length; i < len; i += limit) {
    chunks.push(interimTasks.slice(i, i + limit))
  }

  return serial(chunks.map(chunk => () => parallel(chunk))).then(results =>
    [].concat(...results)
  )
}

module.exports = {
  serial,
  parallel,
}
