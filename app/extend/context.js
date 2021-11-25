/*
 * @Author: Whzcorcd
 * @Date: 2020-08-10 17:06:30
 * @LastEditors: Whzcorcd
 * @LastEditTime: 2021-11-21 21:34:03
 * @Description: file content
 */
'use strict'

module.exports = {
  /**
   * 返回客户端接口标准化内容
   * @param {number} status 返回状态
   * @param {any} data 返回内容
   * @param {string} msg 返回信息
   */
  returnCtxBody(status, data = {}, msg) {
    // this 即 ctx
    this.status = status
    this.body = {
      status,
      data,
      msg,
    }
  },
}
