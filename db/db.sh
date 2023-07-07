docker run  -d -p 3306:3306 \
--name local-mysql \
-e MYSQL_ROOT_PASSWORD=pwdGwgzets \
mysql:8.0 --character-set-server=utf8mb4 --collation-server=utf8mb4_unicode_ci