/*
 * @Author: Whzcorcd
 * @Date: 2020-08-10 11:35:45
 * @LastEditors: Whzcorcd
 * @LastEditTime: 2021-11-21 21:26:02
 * @Description: file content
 */
/* eslint valid-jsdoc: "off" */

'use strict'

/**
 * @param {Egg.EggAppInfo} appInfo app info
 */
module.exports = appInfo => {
  /**
   * built-in config
   * @type {Egg.EggAppConfig}
   **/
  const config = (exports = {})

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1597030415598_9064'

  // add your middleware config here
  config.middleware = []

  // add your user config here
  const userConfig = {
    myAppName: 'frontend-build-service',
    cors: {
      origin: '*',
      allowMethods: 'GET,HEAD,PUT,POST,DELETE,PATCH,OPTIONS',
    },
    security: {
      csrf: {
        enable: false,
        ignoreJSON: true,
        headerName: 'x-csrf-token',
      },
      domainWhiteList: ['http://localhost:7001', 'http://127.0.0.1:7001'],
    },
    bodyParser: {
      jsonLimit: '2mb',
      formLimit: '2mb',
    },
    snowflake: {
      client: {
        machineId: 0,
        machineIdBitLength: 6,
        workerIdBitLength: 4,
        serialIdBitLength: 8,
      },
    },
    redis: {
      client: {
        port: 6379,
        host: '127.0.0.1',
        password: 'whz18267590821',
        db: 0,
        weakDependent: true,
      },
    },
  }

  return {
    ...config,
    ...userConfig,
  }
}
