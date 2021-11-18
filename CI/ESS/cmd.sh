docker-compose down -v
docker-compose build
docker-compose up --force-recreate  --abort-on-container-exit
