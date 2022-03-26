/*
 * @Author: Whzcorcd
 * @Date: 2022-03-02 10:35:28
 * @LastEditors: Whzcorcd
 * @LastEditTime: 2022-03-26 23:02:43
 * @Description: file content
 */
'use strict'

const path = require('path')
const jsonfile = require('jsonfile')
const { projectPath } = require('./target')

const updateVersion = (options, project, release) => {
  return new Promise((resolve, reject) => {
    const deploy = options.deploy
    const version = deploy.version || 'latest'

    const reg = /^(\d+)\.(\d+)\.(\d+)$/
    const result = reg.exec(version)

    if (result && result.length > 0) {
      let major = result[1],
        minor = result[2],
        patch = result[3]
      switch (release) {
        case 'major':
          major++
          minor = patch = 0
          break
        case 'minor':
          minor++
          patch = 0
          break
        case 'patch':
          patch++
          break
        default:
          patch++
          break
      }

      const file = path.resolve(projectPath, `./${project}.json`)
      jsonfile.readFile(file, (err, obj) => {
        if (err) {
          return reject(err)
        }

        const newDeploy = Object.assign({}, obj.deploy, {
          version: `${major}.${minor}.${patch}`,
        })
        const result = Object.assign(obj, { deploy: newDeploy })

        jsonfile.writeFile(file, result, err => {
          if (err) {
            return reject(err)
          }
          return resolve()
        })
      })
    }

    resolve()
  })
}

module.exports = {
  updateVersion,
}
