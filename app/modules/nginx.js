/*
 * @Author: Whzcorcd
 * @Date: 2021-11-25 14:06:54
 * @LastEditors: Whzcorcd
 * @LastEditTime: 2022-03-01 15:19:51
 * @Description: file content
 */
'use strict'

const NginxConfFile = require('nginx-conf').NginxConfFile
const queue = require('./queue')
const loger = require('./loger')
const target = require('./target')

const createNginxFile = (targetPath, options) => {
  const ports = options.deploy.ports || {
    http: 80,
    https: 443,
  }

  return new Promise((resolve, reject) => {
    NginxConfFile.create(targetPath, (err, conf) => {
      if (err || !conf) {
        return reject(err)
      }

      conf.on('flushed', () => {
        resolve()
      })

      conf.nginx._add('user', 'nginx')
      conf.nginx._add('worker_processes', 'auto')
      conf.nginx._add('error_log', '/var/log/nginx/error.log crit')
      conf.nginx._add('pid', '/run/nginx.pid')
      conf.nginx._add('include', '/usr/share/nginx/modules/*.conf')
      conf.nginx._add('worker_rlimit_nofile', 65535)

      conf.nginx._add('events')
      conf.nginx.events[0]._add('use')
      conf.nginx.events[0].use[0]._value = 'epoll'
      conf.nginx.events[0]._add('worker_connections')
      conf.nginx.events[0].worker_connections[0]._value = 65535

      conf.nginx._add('http')
      conf.nginx.http[0]._add('include', '/etc/nginx/mime.types')
      conf.nginx.http[0]._add('default_type', 'application/octet-stream')
      conf.nginx.http[0]._add('charset', 'utf-8')
      conf.nginx.http[0]._add('server_names_hash_bucket_size', '128')
      conf.nginx.http[0]._add('client_header_buffer_size', '2k')
      conf.nginx.http[0]._add('large_client_header_buffers', '4 4k')
      conf.nginx.http[0]._add('client_max_body_size', '100m')
      conf.nginx.http[0]._add('access_log', '/var/log/nginx/access.log')
      conf.nginx.http[0]._add('sendfile', 'on')
      conf.nginx.http[0]._add('tcp_nopush', 'on')
      conf.nginx.http[0]._add('tcp_nodelay', 'on')
      conf.nginx.http[0]._add('keepalive_timeout', '65')
      conf.nginx.http[0]._add('types_hash_max_size', '2048')

      conf.nginx.http[0]._add('gzip', 'on')
      conf.nginx.http[0]._add('gzip_min_length', '1k')
      conf.nginx.http[0]._add('gzip_buffers', '4 16k')
      conf.nginx.http[0]._add('gzip_http_version', '1.1')
      conf.nginx.http[0]._add('gzip_comp_level', '2')
      conf.nginx.http[0]._add(
        'gzip_types',
        'text/plain text/css application/json image/png image/x-icon application/javascript application/x-javascript text/javascript text/xml application/xml application/xml+rss text/cache-manifest application/octet-stream'
      )
      conf.nginx.http[0]._add('gzip_vary', 'on')

      conf.nginx.http[0]._add('server')
      conf.nginx.http[0].server[0]._add('listen', ports.http || 80)
      conf.nginx.http[0].server[0]._add(
        'listen',
        `${ports.https || 443} ssl http2`
      )

      conf.nginx.http[0].server[0]._add(
        'server_name',
        `${options.deploy.region}.${options.deploy.host}`
      )
      conf.nginx.http[0].server[0]._add('root', '/usr/share/nginx/www')

      conf.nginx.http[0].server[0]._add(
        'ssl_certificate',
        `/etc/nginx/ssl/${options.deploy.host}/fullchain.pem`
      )
      conf.nginx.http[0].server[0]._add(
        'ssl_certificate_key',
        `/etc/nginx/ssl/${options.deploy.host}/privkey.pem`
      )
      conf.nginx.http[0].server[0]._add(
        'ssl_protocols',
        'TLSv1 TLSv1.1 TLSv1.2'
      )

      conf.nginx.http[0].server[0]._add(
        'add_header',
        'Access-Control-Allow-Origin *'
      )
      conf.nginx.http[0].server[0]._add(
        'add_header',
        'Access-Control-Allow-Headers X-Requested-With'
      )
      conf.nginx.http[0].server[0]._add(
        'add_header',
        'Access-Control-Allow-Methods GET,POST,OPTIONS'
      )
      conf.nginx.http[0].server[0]._add(
        'add_header',
        `Set-Cookie "$token_key=$arg_token;path=/;domain=${options.deploy.host}"`
      )
      if (options.region !== 'web') {
        conf.nginx.http[0].server[0]._add(
          'add_header',
          `Set-Cookie "GDY_CONSOLE_TYPE_KEY=console;path=/;domain=${options.deploy.host};expires=31 Dec 1970 23:59:59 GMT"`
        )
        conf.nginx.http[0].server[0]._add(
          'add_header',
          'Set-Cookie "GDY_CONSOLE_TYPE_KEY=console;path=/;domain=$host"'
        )
      }

      conf.nginx.http[0].server[0]._add(
        'proxy_set_header',
        'X-Real-IP $remote_addr'
      )
      conf.nginx.http[0].server[0]._add(
        'proxy_set_header',
        'X-Origin-Host $http_origin_host'
      )
      conf.nginx.http[0].server[0]._add(
        'proxy_set_header',
        'X-Forwarded-For $proxy_add_x_forwarded_for'
      )
      conf.nginx.http[0].server[0]._add('proxy_set_header', 'Host $host')

      conf.nginx.http[0].server[0]._add('set', '$q_args $args')
      conf.nginx.http[0].server[0]._add('set', '$token_key "CONSOLE_TOKEN_GDY"')

      conf.nginx.http[0].server[0]._add('error_page', '404 /404.html')
      conf.nginx.http[0].server[0]._add(
        'error_page',
        '500 502 503 504 /50x.html'
      )

      conf.nginx.http[0].server[0]._add('location', '~* /.git/')
      conf.nginx.http[0].server[0].location[0]._add('deny', 'all')
      conf.nginx.http[0].server[0]._add('location', '= /auth_file.txt')
      conf.nginx.http[0].server[0].location[1]._add(
        'root',
        '/usr/share/nginx/www/txt'
      )

      if (options.region !== 'web') {
        conf.nginx.http[0].server[0]._add('location', '/')
        conf.nginx.http[0].server[0].location[2]._add(
          'add_header',
          'Cache-Control "no-cache, no-store"'
        )
        conf.nginx.http[0].server[0].location[2]._add(
          'rewrite',
          '^/?$ /console/index.html last'
        )
      }

      conf.flush()
    })
  })
}

const updateNginxFile = task => {
  const deploy = task.deploy
  const filename = target.nginxProductPath(deploy.target, deploy.region)

  return new Promise((resolve, reject) => {
    NginxConfFile.create(filename, (err, conf) => {
      if (err || !conf) {
        return reject(err)
      }

      conf.on('flushed', () => {
        resolve()
      })

      const len = conf.nginx.http[0].server[0].location.length
      const index = conf.nginx.http[0].server[0].location.findIndex(
        item => item._value === `/${deploy.location || task.name}`
      )

      if (index === -1) {
        conf.nginx.http[0].server[0]._add(
          'location',
          `/${deploy.location || task.name}`
        )
        if (deploy.ssr) {
          conf.nginx.http[0].server[0].location[len]._add(
            'add_header',
            'Vary "Accept-Encoding, User-Agent"'
          )
          conf.nginx.http[0].server[0].location[len]._add(
            'proxy_http_version',
            '1.1'
          )
          conf.nginx.http[0].server[0].location[len]._add(
            'proxy_pass',
            `http://172.18.0.1:${deploy.service.port || 3000}`
          )
          conf.nginx.http[0].server[0].location[len]._add(
            'index',
            'index.html index.htm'
          )
        } else {
          conf.nginx.http[0].server[0].location[len]._add(
            'add_header',
            'Cache-Control "no-cache, no-store"'
          )
          conf.nginx.http[0].server[0].location[len]._add(
            'try_files',
            `$uri $uri/ /${task.deploy.location || task.name}/index.html`
          )
        }
      }

      conf.flush()
    })
  })
}

const runNginx = async tasks => {
  const taskSet = [[]]
  let preOrder = 0

  const generateTaskFunc = task => () => {
    const time = Date.now()

    return updateNginxFile(task)
      .then(() => {
        const timeEnd = Math.round((Date.now() - time) / 1000)
        loger.log('░░', 'ElapsedTime:', `${timeEnd}s`)
      })
      .catch(errors => {
        throw errors
      })
  }

  tasks
    .sort((a, b) => a.order - b.order)
    .forEach(task => {
      if (task.order === preOrder) {
        taskSet[taskSet.length - 1].push(generateTaskFunc(task))
      } else {
        taskSet.push([generateTaskFunc(task)])
      }
      preOrder = task.order
    })

  // 同步更新文件，使用多线程会导致问题
  return queue
    .serial(
      taskSet.map(set => () => {
        return queue.serial(set)
      })
    )
    .then(buildResults => {
      return [].concat(...buildResults)
    })
}

module.exports = { createNginxFile, runNginx }
