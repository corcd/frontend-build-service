/*
 * @Author: Whzcorcd
 * @Date: 2021-11-29 11:22:06
 * @LastEditors: Whzcorcd
 * @LastEditTime: 2021-11-29 11:46:05
 * @Description: file content
 */
'use strict'

// 增量筛选
const incrementalFilter = (tasks, options) => {
  if (
    !Object.prototype.hasOwnProperty.call(options, 'increment') ||
    options.increment.length === 0
  ) {
    return tasks
  }

  return tasks.filter(task => options.increment.includes(task.name))
}

module.exports = incrementalFilter
