#!/bin/bash

docker stop chat_app &&
docker image prune -y &&
docker build -t chat_app . &&
docker start -p 80:8080 chat_app &&
exit
