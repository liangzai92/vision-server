#!/bin/bash
IMAGE_NAME=product-env-mirror-service-registry.cn-beijing.cr.aliyuncs.com/xiwang/fe-liangzai
TAG=latest
CONTAINER_NAME=liangzai-main-container
if [ $(docker ps -q -f name=$CONTAINER_NAME) ]; then
    docker container stop $CONTAINER_NAME
    docker container rm $CONTAINER_NAME
fi
if [ $(docker images -q $IMAGE_NAME:$TAG) ]; then
    docker rmi $IMAGE_NAME:$TAG
fi
docker image pull $IMAGE_NAME:$TAG
docker container run -it --name $CONTAINER_NAME -p 9528:9528 -d -e NODE_ENV=production $IMAGE_NAME:$TAG
docker container ls