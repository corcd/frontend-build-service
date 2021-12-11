/*
 * @Author: Whzcorcd
 * @Date: 2021-11-26 10:07:32
 * @LastEditors: Whzcorcd
 * @LastEditTime: 2021-12-11 19:56:29
 * @Description: file content
 */
'use strict'

const loger = require('./loger')

class ErrorCapturer {
  constructor() {
    this.unexpectedTaskList = []
  }

  // TODO: 完善错误追踪
  add(task, reason) {
    this.unexpectedTaskList.push({ task, reason })
  }

  analyse() {
    loger.log('░░', `Unexpected Task: ${this.unexpectedTaskList.length}`)
    this.unexpectedTaskList.map((item, index) =>
      loger.error(`${index + 1}. `, String(item.reason))
    )
  }

  clear() {
    this.unexpectedTaskList = []
  }
}

const instance = new ErrorCapturer()
module.exports = instance
