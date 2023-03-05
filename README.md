# Выпускной проект по курсу : "Linux Administrator Professional."

**Тема: "Развертывание веб сервера Wordpress на базе контейнеров docker с отказоустойчивой базой данных на основе MySQL INNO-DB Cluster"**

---
**Описание проекта.**

Основная инфраструктурная часть проекта описывается в двух docker compose файлах:

- [Первый ](https://github.com/ChurikovAnatolii/OTUS_PROJ/blob/main/docker-compose.yml) разворачивает основную инфраструктуру: три инстанса базы данных MySQL с настроенными параметрами для групповой репликации, MySQL Router для подключения клиентов к базе данных и маршрутизации обращений к кластеру БД, WordPress на основе PHP-FPM и NGINX как веб сервер.

- [Второй ](https://github.com/ChurikovAnatolii/OTUS_PROJ/blob/main/Loging/docker-compose.yml) разворачивает систему логирования на основе Fluent-Bit для сбора логов с docker контейнеров , Elasticsearch для хранения и индексации логов, Kibana для отображения логов в нужном формате.


Проект разворачивается на трех bare metal серверах c использованием docker swarm в качестве оркестратора в соответствии со cхемой.

![Image alt][def]


[def]: https://github.com/ChurikovAnatolii/OTUS_PROJ/blob/main/Untitled Diagram.jpg

## Описание основных сервисов.

***Основная часть проекта разворачивается на хосте ATVVO. Ngnix по протоколу FastCGI связан с WordPress для обработки HTTP запросов от пользователей. WordPress подключен к базе данных через MySQL Router, который в свою очередь маршрутизирует запросы в кластер баз данных. На этом же хосте (ATVVO) запущен один сервис БД. На хостах srv1 и srv2 запущены по одному сервису БД. В кластере INNO-DB из 3 инстансов может без последствий отказать один. Далее работа производится на двух инстансах, но без отказоустойчивости. Настройки MySQL servers и Router вынесены в отдельные файлы. Каждый инстанс БД использует свой docker volume примонтированный локально. Для создания кластера используется два скрипта:***

- ***setupCluster.js используется для запуска в MySQL shell внутри сети сервисов для создания кластера.***
- ***cluster-setup.sh копирует скрипт setupCluster.js в нужный контейнер и запускает его.***

***Конфиг nginx примонтирован локально, для подключения к проекту используется порт 8022.***

## Описание сбора логов

***В проекте организован централизованный сбор логов со следующих сервисов: nginx, MySQL Router, MySQL srv1, srv2, srv3, wordpress. Для сбора логов используется fluentd logging driver, fluent-bit использует forward input plugin. Fluen-bit запущен в режиме 3 реплик и каждый собирает логи со своего хоста. Все логи передаются в elasticsearch, который запущен на хосте ATVVO, kibana так же запущена на хосте ATVVO. Для логов nginx в Fluent-bit используется парсер Nginx, чтобы создать дополнительные поля и иметь возможность фильтрации по ним. Остальные логи передаются без изменений с указанием container_id. Формат передачи логов в elastic выбран Logstash.***

## Описание состава проекта.

- Папка ***Logging*** содержит docker compose для запуска подсистемы сбора логов и конфигурационные файлы Fluent-Bit
- Папка ***mysql-shell/scripts*** содержит скрипт для создания MySQL кластера.
- Папка ***nginx*** содержит конфиг nginx
- файл ***docker-compose.yml*** в корневом каталоге служит для запуска основных сервисов.
- файл ***cluster_setup.sh*** bash-script для запуска js внутри сети сервисов.
- mysql-router, server cодержит настройки для MySQL Router и MySQL server.

## Запуск проекта.

Запуск проекта осуществляется в следующем порядке:

0. После того как создали docker swarm и добавили две worker ноды.
console
OTUS_PROJ git:(main)  docker node ls
ID                            HOSTNAME  STATUS    AVAILABILITY  MANAGER STATUS  ENGINE VERSION
rvyyfvtcueu00c4y98oxmawwu *  ATVVO      Ready    Active        Leader          20.10.22
y0fixekayhmr9mra8zsmgv2t6    srv1      Ready    Active                          23.0.1
x6u1sz0slk27qnzwu1yyrchvc    srv2      Ready    Active                          23.0.1


1. С хоста ATVVO запустить docker-compose из папки logging командой
console
docker stack deploy -c Loging/docker-compose.yml project_logs

2. Запустить docker compose из корневого каталога
console
docker stack deploy -c docker-compose.yml project_DB

3. Ждум когда сервисы DB встанут в состояние healthy
console
4s064oszoq1k  project_DB_srv1              replicated  1/1        mysql/mysql-server:latest  *:3301->3306/tcp
hqpb9547kbg2  project_DB_srv2              replicated  1/1        mysql/mysql-server:latest  *:3302->3306/tcp
3hm6s56cmcra  project_DB_srv3              replicated  1/1        mysql/mysql-server:latest  *:3303->3306/tcp

4. Запускаем ./cluster_setup.sh, ждем окончания создания кластера.

5. Wordpress доступен по адресу 192.168.2.131:8022, Kibana по адресу 192.168.2.131:5601