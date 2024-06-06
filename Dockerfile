FROM node:16.16.0
LABEL maintainer = "郭梁 <w_guoliang@adebibi.com>"

RUN mkdir -p /app
WORKDIR /app
COPY . .

RUN rm -rf ./pnpm-lock.yaml
RUN npm config set registry https://packages.aliyun.com/61e54b0e0bb300d827e1ae27/npm/npm-registry/
RUN npm install pnpm --location=global
RUN npm install -g pm2
RUN pnpm install
RUN pnpm run build

EXPOSE 9528
CMD ["pm2", "start", "ecosystem.config.js", "--no-daemon"]