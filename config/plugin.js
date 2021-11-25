/*
 * @Author: Whzcorcd
 * @Date: 2020-08-10 11:35:45
 * @LastEditors: Whzcorcd
 * @LastEditTime: 2020-12-03 17:09:57
 * @Description: file content
 */

'use strict'

/** @type Egg.EggPlugin */
module.exports = {
  validate: {
    enable: true,
    package: 'egg-validate',
  },
  cors: {
    enable: true,
    package: 'egg-cors',
  },
  snowflake: {
    enable: true,
    package: 'egg-snowflake',
  },
  redis: {
    enable: true,
    package: 'egg-redis',
  },
}
