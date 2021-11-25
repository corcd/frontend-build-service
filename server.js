/*
 * @Author: Whzcorcd
 * @Date: 2020-12-03 17:34:38
 * @LastEditors: Whzcorcd
 * @LastEditTime: 2020-12-03 17:34:48
 * @Description: file content
 */

'use strict'

const egg = require('egg')

const workers = Number(process.argv[2] || require('os').cpus().length)
egg.startCluster({
  workers,
  baseDir: __dirname,
})
