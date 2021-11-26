/*
 * @Author: Whzcorcd
 * @Date: 2021-11-26 10:07:32
 * @LastEditors: Whzcorcd
 * @LastEditTime: 2021-11-26 10:20:14
 * @Description: file content
 */
'use strict'

const loger = require('./loger')

class ErrorCapturer {
  constructor() {
    this.unexpectedTaskList = []
  }

  add(taskName) {
    this.unexpectedTaskList.push(taskName)
  }

  analyse() {
    loger.log(
      '░░',
      `Unexpected Task:${this.unexpectedTaskList.length}`,
      this.unexpectedTaskList.join(',')
    )
  }

  clear() {
    this.unexpectedTaskList = []
  }
}

const instance = new ErrorCapturer()

module.exports = instance
