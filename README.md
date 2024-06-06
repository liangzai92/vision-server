# liangzai-server

相关技术请参阅对应的官方文档
- MVC 框架使用的[Nest](https://github.com/nestjs/nest)
- ORM 框架使用的[prisma](https://github.com/prisma)，这玩意要慎用。
- 数据库使用的 mongo。

## 本地开发

### 1. 安装
```bash
$ pnpm install
```

⚠️依赖注意事项注意：

#### 关于 bcrypt
如果遇到 bcrypt的问题（环境不同可能不一定遇到），需要手动处理一下，`./postinstall.sh`脚本内容就是处理脚本。具体 issues 见： <https://github.com/pnpm/pnpm/issues/5372#issuecomment-1253424150>。

#### 关于 prisma
1. 首次（重新）安装npm 包后，需要执行`npx prisma generate`生成 prisma client 代码。
2. 如果`prisma/schema.prisma`文件有变动，除了执行`npx prisma generate`，还需要执行`npx prisma db push`，具体见[prisma 文档](https://www.prisma.io/docs/concepts/components/prisma-schema/data-model#updating-the-database)。

### 2. 运行

```bash
pnpm run dev
# 实际上执行的就是 pnpm run start:dev
```
至此，项目就 dev 起来了。

> ⚠️注意：首次启动如果报Prisma的错误，大概率是在安装 npm 后没有执行`npx prisma generate`，具体可学习以下 prisma。

### 3. 更多 nestjs 的命令：

```bash
# development
$ pnpm run start

# watch mode
$ pnpm run start:dev

# production mode
$ pnpm run start:prod
```

## 部署
> 已配置两条流水线：测试流水线和生产流水线。

### 目前公司内前端服务器现状
服务器上 nodejs 版本是 v14.19.0。这个需要非常注意。目前我分别在下面两台服务器发布了服务。
- product-front-editor-platform【前端编辑器正式环境】。
  - 域名：editor.xiwang.com
- product-front-editor-test-env【前端编辑器测试环境】。
  - 域名：editor-test.xiwang.com

### Docker 部署
本来想就遵循目前已有nodejs 应用使用 pm2 部署的方式发布，但鉴于版本依赖（对 nodejs 版本的要求）的不同，我不得不上了docker，还没细化部署细节，有待优化的地方，比如 volume。
- 服务器上安装 docker。我已经把下面两个机器安装了 docker 环境。
 - product-front-editor-platform【前端编辑器正式环境】。
 - product-front-editor-test-env【前端编辑器测试环境】。
- 流水线构建docker 镜像，详情参考阿里云流水线信息。
- 主机部署：拉取镜像，运行容器。

### Nginx 配置
nginx 配置路径，测试环境为例：`/etc/nginx/conf.d/editor-test.xiwang.com.conf`。

代理所有已`/liangzai`开头的请求到本地的 `9528` 端口，具体配置如下：

```conf
location ~* ^/liangzai/(.*)$ {
  proxy_set_header X-Real-IP $remote_addr;
  proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  proxy_set_header Host $http_host;
  proxy_set_header X-NginX-Proxy true;
  proxy_pass http://127.0.0.1:9528/$1$is_args$args;
  proxy_redirect off;

  if ($request_method = 'OPTIONS') {
    add_header 'Access-Control-Allow-Origin' $http_origin always;
    add_header Access-Control-Allow-Credentials true;
    add_header Access-Control-Allow-Methods 'GET, POST, PUT, DELETE, PATCH, OPTIONS';
    add_header Access-Control-Allow-Headers 'DNT,X-Mx-ReqToken,Keep-Alive,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Authorization,X-Rq-Authorization';
    return 204;
  }
}
```
>⚠️：既然nginx 是这样配置的，那对应前端请求的时候，需要注意别漏掉`/liangzai`前缀，接口访问注意是`https://editor-test.xiwang.com/liangzai`和`https://editor.xiwang.com/liangzai`。

## Todo
- 目前 ticket是参考彩虹猫暂时本地一个文件存储的，先凑活用，后面需要改成数据库和redis。

## 关于mongo

### 开发环境
- 第一种：直接连的线上的 mongo 测试库，具体看`.env.development`文件里的配置。
- 第二种：本地安装 mongo，本地启动 mongo 服务。（自己搞定）。

### 测试和生产环境
mongo 链接在生产和测试环境发布的时候要**内网连接**，具体直接看[阿里云MongoDB 数据库详细信息](https://mongodb.console.aliyun.com/replicate/cn-beijing/instances/dds-2ze8524d6978f454/basicInfo?spm=5176.yaochi_portal_overview.0.0.59214d7e2R6iWE)

## 关于 Prisma

```sh
npx prisma generate
npx prisma db push
```
- Must be running MongoDB 4.2+ as a replica set
- Whenever you update your Prisma schema, you will need to run the`prisma db push` command to create new indexes and regenerate Prisma Client.
- MongoDB does not support `@@id`. MongoDB does not support composite IDs, which means you cannot identify a model with a `@@id` attribute.

## 知音楼登录
- 接入知音楼登录，参考[造物神](https://service.saash.vdyoo.com/new/app/list/my)。
- 相关配置已写入`.env.*` 文件
