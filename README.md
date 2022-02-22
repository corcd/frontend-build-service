<!--
 * @Author: Whzcorcd
 * @Date: 2020-08-10 11:35:45
 * @LastEditors: Whzcorcd
 * @LastEditTime: 2022-02-22 23:40:33
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

```shell
node bin/fbs.js build --project <name> --filter <task> --pack
```

参数：

- `--project <name>` 对应项目

- `--filter <task>` 按需构建

- `--pack` 构建完成后自动执行打包

#### pack

```shell
node bin/fbs.js pack <name>
```

参数：

- `<name>` 对应项目

### Use Webhooks

coming soon

## Project Configuration

details in `./workspace/projects/example.json`

## Environment

node.js >= 14.0

## License

MIT
