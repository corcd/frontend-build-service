/*
 * @Author: Whzcorcd
 * @Date: 2020-08-16 11:44:34
 * @LastEditors: Whzcorcd
 * @LastEditTime: 2021-11-23 16:15:01
 * @Description: file content
 */

'use strict'

const Controller = require('egg').Controller

class ExecuteController extends Controller {
  run() {
    const { ctx } = this
    const rule = {
      name: {
        type: 'string',
        required: true,
      },
    }
    try {
      ctx.validate(rule, ctx.request.body)
    } catch (err) {
      ctx.logger.warn(err.errors)
      ctx.returnCtxBody(400, {}, 'illegal parameters')
      return
    }
    try {
      ctx.service.run.index(ctx.request.body.name)
    } catch (err) {
      ctx.logger.error(err)
      return ctx.returnCtxBody(
        500,
        {
          err,
        },
        'failed'
      )
    }
    return ctx.returnCtxBody(200, {}, 'success')
  }
}

module.exports = ExecuteController
