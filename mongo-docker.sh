#!/usr/bin/env bash
docker run -d --name "mongo-dash" -p 27017:27017 -p 28017:28017 -e AUTH=no tutum/mongodb
alias mongo='docker exec -ti mongo-dash mongo admin'