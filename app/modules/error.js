/*
 * @Author: Whzcorcd
 * @Date: 2021-11-26 10:07:32
 * @LastEditors: Whzcorcd
 * @LastEditTime: 2021-11-26 14:00:27
 * @Description: file content
 */
'use strict'

const loger = require('./loger')

class ErrorCapturer {
  constructor() {
    this.unexpectedTaskList = []
  }

  // TODO: 完善错误追踪
  add(task) {
    this.unexpectedTaskList.push(task)
  }

  analyse() {
    loger.log('░░', `Unexpected Task: ${this.unexpectedTaskList.length}`)
  }

  clear() {
    this.unexpectedTaskList = []
  }
}

const instance = new ErrorCapturer()

module.exports = instance
