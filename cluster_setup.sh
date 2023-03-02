#! /bin/bash

# get id from srv1 Mysql server container
container_id=$(docker ps | grep mysql/mysql-server:latest | awk '{print $1}')
# copy js script to mysql srv1 container
docker cp mysql-shell/scripts/setupCluster.js $container_id:/tmp
# start js init script
docker exec $container_id mysqlsh --file /tmp/setupCluster.js   
