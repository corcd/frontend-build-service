/*
 * @Author: Whzcorcd
 * @Date: 2021-11-22 13:09:21
 * @LastEditors: Whzcorcd
 * @LastEditTime: 2021-11-22 13:26:07
 * @Description: file content
 */
'use strict'

module.exports = (string, data) => string.replace(/\$\{([^\}]*?)\}/g, ($0, key) => String(data[key]))
