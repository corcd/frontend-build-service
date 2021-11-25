/*
 * @Author: Whzcorcd
 * @Date: 2021-06-06 18:20:22
 * @LastEditors: Whzcorcd
 * @LastEditTime: 2021-08-06 11:37:12
 * @Description: file content
 */
'use strict'

const { spawn } = require('child_process')
const { EventEmitter } = require('events')

/**
 * 子进程工厂
 * @param  {string}        cmd        命令行
 * @param  {string[]}      args       命令行参数
 * @param  {object}        options    配置选项
 * @return {EventEmitter}             事件触发器
 */
const spawnFactory = (cmd, args, options) => {
  const raw = spawn(cmd, args, options)
  const event = new EventEmitter()

  raw
    .on('error', err => {
      err.file = cmd
      event.emit('error', err)
    })
    .on('close', (code, signal) => {
      // Create ENOENT error because Node.js v0.8 will not emit
      // an `error` event if the command could not be found.
      if (code === 127) {
        const err = new Error('spawn ENOENT')
        err.code = 'ENOENT'
        err.errno = 'ENOENT'
        err.syscall = 'spawn'
        err.file = cmd
        event.emit('error', err)
      } else {
        event.emit('close', code, signal)
      }
    })

  event.stdin = raw.stdin
  event.stdout = raw.stdout
  event.stderr = raw.stderr
  event.kill = sig => raw.kill(sig)

  return event
}

module.exports = spawnFactory
