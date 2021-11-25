/*
 * @Author: Whzcorcd
 * @Date: 2021-06-06 17:57:04
 * @LastEditors: Whzcorcd
 * @LastEditTime: 2021-11-25 16:39:05
 * @Description: file content
 */
'use strict'

const npmRunPath = require('npm-run-path')
const defaultsDeep = require('lodash/defaultsDeep')
const spawnFactory = require('./spawn')

// 默认执行器工厂
const defaultCmdFactory = (cmd, { env, cwd, uid, gid }, callback) => {
  const conf = {
    env,
    cwd,
    uid,
    gid,
    stdio: 'ignore',
  }

  let sh = 'sh'
  let shFlag = '-c'

  // 兼容 windows 运行环境
  if (process.platform === 'win32') {
    sh = process.env.ComSpec || 'cmd.exe'
    shFlag = '/d /s /c'
    conf.windowsVerbatimArguments = true
  }

  const proc = spawnFactory(sh, [shFlag, cmd], conf)

  // 子进程错误
  proc.on('error', procError)

  // 子进程退出
  proc.on('close', (code, signal) => {
    if (signal) {
      process.kill(process.pid, signal)
    } else if (code) {
      const err = new Error(`child process exited with code ${code}`)
      err.errno = code
      procError(err)
    } else {
      callback(null)
    }
  })
  process.once('SIGTERM', procKill)
  process.once('SIGINT', procInterrupt)

  function procError(err) {
    if (err) {
      if (err.code !== 'EPERM') {
        err.code = 'ELIFECYCLE'
      }
    }
    process.removeListener('SIGTERM', procKill)
    process.removeListener('SIGTERM', procInterrupt)
    process.removeListener('SIGINT', procKill)
    return callback(err)
  }

  function procKill() {
    proc.kill()
  }

  function procInterrupt() {
    proc.kill('SIGINT')
    proc.on('exit', () => {
      process.exit()
    })
    process.once('SIGINT', procKill)
  }

  return {
    kill: procKill,
  }
}

// 自定义执行器工厂
const customCmdFactory = (cmd, args, { env, cwd, uid, gid }, callback) => {
  const conf = {
    env,
    cwd,
    uid,
    gid,
    stdio: 'ignore',
  }

  const proc = spawnFactory(cmd, [...args], conf)

  // 子进程错误
  proc.on('error', procError)

  // 子进程退出
  proc.on('close', (code, signal) => {
    if (signal) {
      process.kill(process.pid, signal)
    } else if (code) {
      const err = new Error(`child process exited with code ${code}`)
      err.errno = code
      procError(err)
    } else {
      callback(null)
    }
  })
  process.once('SIGTERM', procKill)
  process.once('SIGINT', procInterrupt)

  function procError(err) {
    if (err) {
      if (err.code !== 'EPERM') {
        err.code = 'ELIFECYCLE'
      }
    }
    process.removeListener('SIGTERM', procKill)
    process.removeListener('SIGTERM', procInterrupt)
    process.removeListener('SIGINT', procKill)
    return callback(err)
  }

  function procKill() {
    proc.kill()
  }

  function procInterrupt() {
    proc.kill('SIGINT')
    proc.on('exit', () => {
      process.exit()
    })
    process.once('SIGINT', procKill)
  }

  return {
    kill: procKill,
  }
}

// 命令执行器
const runCmd = (command, originalOptions = {}) => {
  const target = originalOptions.target
  delete originalOptions.target

  const options = defaultsDeep(
    {},
    {
      env: npmRunPath.env({
        cwd: originalOptions.cwd || process.cwd(),
        env: defaultsDeep({}, originalOptions.env, process.env),
      }),
      timeout: 10 * 60 * 1000,
    },
    originalOptions
  )

  return new Promise((resolve, reject) => {
    let timer = null
    const callback = (errors, data) => {
      // 成功执行 cb 时清除超时定时器
      timer && clearTimeout(timer)

      if (errors) {
        errors.message = `run "${command}" failed: ${errors.message}`
        return reject(errors)
      }
      return resolve(data)
    }

    // 子进程实例
    const childInstance =
      target === 'custom'
        ? customCmdFactory(
          command[0],
          command.slice(1, command.length),
          options,
          callback
        )
        : defaultCmdFactory(command, options, callback)

    if (options.timeout) {
      // 超时主动 kill 子进程
      timer = setTimeout(() => {
        childInstance.kill()
        callback(new Error('child process timeout'))
      }, options.timeout)
    }
  })
}

module.exports = {
  runCmd,
}
