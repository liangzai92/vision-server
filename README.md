# vision-server

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