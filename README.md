<!--
 * @Author: Whzcorcd
 * @Date: 2020-08-10 11:35:45
 * @LastEditors: Whzcorcd
 * @LastEditTime: 2022-03-26 23:37:20
 * @Description: file content
-->

# Frontend-Build-Service

Cloud Platform GCloud frontend build service with several new features such as parallel build support

## How to use

### Installation

```shell
yarn install
```

### Use CommandLine

#### build

构建

```shell
node bin/fbs.js build --project <name> --filter <task> --pack <version>
```

参数：

- `--project <name>` 对应项目工程名

- `--filter <task>` 按需构建的任务名

- `--pack <version>` 发布版本、构建并打包（支持 major、minor、patch，默认为 patch 版本）

#### pack

打包

```shell
node bin/fbs.js pack --project <name> --release <version>
```

参数：

- `--project <name>` 对应项目工程名

- `--release <version>` 发布版本（支持 major、minor、patch，默认为 patch 版本）

#### upgrade

版本迭代

```shell
node bin/fbs.js upgrade --project <name> --release <version>
```

参数：

- `--project <name>` 对应项目工程名

- `--release <version>` 发布版本（支持 major、minor、patch，默认为 patch 版本）

#### clear

清理

```shell
node bin/fbs.js clear --container <name> --all
```

参数：

- `--container <name>` 对应 container 名

- `--all` 是否清空 containers 目录

### Use Webhooks

coming soon

## Project Configuration

details in `./workspace/projects/example.json`

## Environment

node.js >= 14.0

## License

MIT
