/*
 * @Author: Whzcorcd
 * @Date: 2020-08-10 11:35:45
 * @LastEditors: Whzcorcd
 * @LastEditTime: 2020-08-10 20:04:27
 * @Description: file content
 */

'use strict'

module.exports = {
  write: true,
  prefix: '^',
  plugin: 'autod-egg',
  test: ['test', 'benchmark'],
  dep: ['egg', 'egg-scripts'],
  devdep: [
    'egg-ci',
    'egg-bin',
    'egg-mock',
    'autod',
    'autod-egg',
    'eslint',
    'eslint-config-egg',
  ],
  exclude: ['./test/fixtures', './dist'],
}
