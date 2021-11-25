/*
 * @Author: Whzcorcd
 * @Date: 2020-08-10 11:35:45
 * @LastEditors: Whzcorcd
 * @LastEditTime: 2021-11-23 16:15:22
 * @Description: file content
 */
'use strict'

module.exports = app => {
  const { router, controller } = app
  router.post('/execute/run', controller.execute.run)
}
