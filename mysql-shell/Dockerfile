FROM mysql/mysql-server

COPY scripts/setupCluster.js /home/setupCluster.js
CMD ["mysqlsh","--file", "/home/setupCluster.js"]
